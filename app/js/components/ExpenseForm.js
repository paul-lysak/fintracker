define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
    "dojo/text!./templates/ExpenseForm.html", "dijit/form/_FormMixin", "dojo/_base/lang", "dojo/date/stamp" ],
    function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, formTemplate, FormMixin, lang, stamp){
        return declare("components.ExpenseForm", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, FormMixin], {
			templateString: formTemplate,
			
			_originalExpense: null,

			_setCategoriesMapAttr: function(categoriesMap) {
				this.categoriesMap = categoriesMap;

				//TODO clear categories before adding options. There's no ready-made dojo api for this 
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
				var expense = {_id: this._originalExpense._id, 
						_rev: this._originalExpense._rev}
				lang.mixin(expense, this.get("value"));
				expense.expDate = stamp.toISOString(expense.expDate, {selector: "date"});
				return expense;
			},

			reset: function() {
				this.inherited(arguments);
				this._originalExpense = null;
			}
        });
}); 
