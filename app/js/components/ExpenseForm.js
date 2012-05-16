define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
    "dojo/text!./templates/ExpenseForm.html", "dijit/form/_FormMixin" ],
    function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, formTemplate, FormMixin){
        return declare("components.ExpenseForm", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, FormMixin ], {
			templateString: formTemplate,
			
			_originalExpense: null,

			_setCategoriesMapAttr: function(categoriesMap) {
				this.categoriesMap = categoriesMap;

				//TODO clear categories before adding options 
				for(var optName in categoriesMap) {
					this.category.addOption({value: optName, 
						label: categoriesMap[optName]});
				}
			},

			_setSomestuffAttr: function(expense) {
				console.log("somestuff setter called", expense);	
			},
	
			_setExpenseAttr: function(expense) {
				console.log("setter called", expense);	
				this._originalExpense = expense; 
				this.set("value", expense);
			},

			_getExpenseAttr: function() {
				var expense = this.get("value");
				expense._id = this._originalExpense._id;
				expense._rev = this._originalExpense._rev;
		//TODO format date
				return expense;
			},

			reset: function() {
				this.inherited(arguments);
				this._originalExpense = null;
			}
        });
}); 
