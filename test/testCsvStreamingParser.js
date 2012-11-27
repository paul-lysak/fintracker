define(["doh/runner", "components/CsvStreamingParser"], function(doh, CsvStreamingParser){
	function assertArrayLength(len, array) {
		doh.assertTrue("length" in array);
		doh.assertEqual(len, array.length);
	}

    doh.register("CsvStreamingParser", [
      function testParseHead() {
	  	var parser = new CsvStreamingParser(); 
		var batch;
		batch = parser.parse("first field, second field, \"third field\"");
        assertArrayLength(0, batch);
		var lastObj = parser.end();
        doh.assertEqual(null, lastObj);
		assertArrayLength(3, parser._fieldKeys);
	    doh.assertEqual(["first field", "second field", "third field"], parser._fieldKeys);	
      },

	  function testParseOneRow() {
		var parser = new CsvStreamingParser(); 
		var batch;
		batch = parser.parse("one, two\noneVal, twoVal");
        assertArrayLength(0, batch);
		batch = parser.end();
	    doh.assertEqual({one: "oneVal", two: "twoVal"}, batch);	
	  },

	  function testParseTwoRow() {
		var parser = new CsvStreamingParser(); 
		var batch;
		batch = parser.parse("one, two\noneRowOne, twoRowOne");
        assertArrayLength(0, batch);
		batch = parser.parse("\noneRowTwo, twoRowTwo");
	    doh.assertEqual([{one: "oneRowOne", two: "twoRowOne"}], batch);	
		batch = parser.end();
	    doh.assertEqual({one: "oneRowTwo", two: "twoRowTwo"}, batch);	
	  },

	  function testBuildObject() {
	  	parser = new CsvStreamingParser();
		var actualObj = parser.buildObject(["true", "123", "123.45", "123hi all", '"hi ""all"""'], 
		["boolType", "intType", "floatType", "strType", "strTypeQuoted"])
		var expObj = {boolType: true, intType: 123, floatType: 123.45, strType: "123hi all", strTypeQuoted: 'hi "all"'}
		doh.assertEqual(expObj, actualObj);
	  }
    ]);

});
