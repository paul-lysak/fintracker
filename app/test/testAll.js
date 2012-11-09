define(["doh/runner", "components/Utils", "components/CsvBatchParser"], function(doh, utils, CsvBatchParser){
//TODO actual tests
	doh.register("Utils", [
		function testMin() {
			doh.assertEqual(3, utils.min(3,4));
			doh.assertEqual(5, utils.min(5,5));
			doh.assertEqual(6, utils.min(6,7));
		},
		function testMax() {
			doh.assertEqual(4, utils.max(3,4));
			doh.assertEqual(5, utils.max(5,5));
			doh.assertEqual(7, utils.max(6,7));
		}

	]);

	function assertArrayLength(len, array) {
		doh.assertTrue("length" in array);
		doh.assertEqual(len, array.length);
	}

    doh.register("CsvBatchParser", [
      function testParseHead() {
	  	var parser = new CsvBatchParser(); 
		var batch;
		batch = parser.parse("first field, second field, \"third field\"");
        assertArrayLength(0, batch);
		var lastObj = parser.end();
        doh.assertEqual(null, lastObj);
		assertArrayLength(3, parser._fieldKeys);
	    doh.assertEqual(["first field", "second field", "third field"], parser._fieldKeys);	
      },

	  function testParseOneRow() {
		var parser = new CsvBatchParser(); 
		var batch;
		batch = parser.parse("one, two\noneVal, twoVal");
        assertArrayLength(0, batch);
		batch = parser.end();
	    doh.assertEqual({one: "oneVal", two: "twoVal"}, batch);	
	  },

	  function testParseTwoRow() {
		var parser = new CsvBatchParser(); 
		var batch;
		batch = parser.parse("one, two\noneRowOne, twoRowOne");
        assertArrayLength(0, batch);
		batch = parser.parse("\noneRowTwo, twoRowTwo");
	    doh.assertEqual([{one: "oneRowOne", two: "twoRowOne"}], batch);	
		batch = parser.end();
	    doh.assertEqual({one: "oneRowTwo", two: "twoRowTwo"}, batch);	
	  },

	//TODO tests for buildObject()
      {
        name: "thingerTest",
        setUp: function(){
        },
        runTest: function(){
			doh.assertTrue(!false);
        },
        tearDown: function(){
        }
      },
    ]);

});
