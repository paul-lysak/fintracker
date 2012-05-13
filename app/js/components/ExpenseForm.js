define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
    "dojo/text!./templates/ExpenseForm.html", "dijit/form/_FormMixin" ],
    function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, formTemplate, FormMixin){
        return declare("components.ExpenseForm", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, FormMixin ], {
			templateString: formTemplate,
			
			_setCategoriesMapAttr: function(categoriesMap) {
				this.categoriesMap = categoriesMap;

				//TODO clear categories before adding options 
				for(var optName in categoriesMap) {
					this.controls.category.addOption({value: optName, 
						label: categoriesMap[optName]});
				}
			},

			postCreate: function() {
				var element = this.domNode;
				this.controls = {
					amount: dijit.getEnclosingWidget(dojo.query("[name=amount]", element)[0]),
					expDate: dijit.getEnclosingWidget(dojo.query("[name=expDate]", element)[0]),
					category: dijit.getEnclosingWidget(dojo.query("[name=category]", element)[0]),
					comment: dijit.getEnclosingWidget(dojo.query("[name=comment]", element)[0])
				}
			}

        });
}); 
