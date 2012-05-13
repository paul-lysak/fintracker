define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", 
    "dojo/text!./templates/ExpenseForm.html", "dijit/form/_FormMixin" ],
    function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, formTemplate, FormMixin){
        return declare("fintracker.ExpenseForm", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, FormMixin ], {
			templateString: formTemplate
        });
}); 
