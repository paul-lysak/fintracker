define(["doh/runner", "components/Utils"], function(doh, utils){
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
});
