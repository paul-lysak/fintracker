define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
    "dojo/text!./templates/ExpenseForm.html", "dijit/form/_FormMixin" ],
    function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, formTemplate, FormMixin){
        return declare("components.ExpenseForm", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, FormMixin ], {
			templateString: formTemplate,
			
			_setCategoriesMapAttr: function(categoriesMap) {
				this.categoriesMap = categoriesMap;

				//TODO clear categories before adding options 
				for(var optName in categoriesMap) {
					this.category.addOption({value: optName, 
						label: categoriesMap[optName]});
				}
			}

        });
}); 
