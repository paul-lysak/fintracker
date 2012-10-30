define(["doh/runner"], function(doh){
//TODO actual tests
    doh.register("CSV converter", [
      function assertTrueTest(){
        doh.assertTrue(true);
        doh.assertTrue(1);
      },
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
