(function(){
	var b=function(a){
		return {title:a.lang.doksoft_image_embed.dlg_title,
			    minWidth:420,
			    minHeight:70,
			    onOk:function(){
			    	if(window.File&&window.FileReader&&window.FileList&&window.Blob){
			    		var e=this;
			    		var element_current=e.parts.contents.$.firstElementChild;
			    		while (element_current.firstElementChild != null) {
			    			element_current = element_current.firstElementChild;
			    		}
			    		var d=document.getElementById(element_current.id).files
			    		var c=new FileReader();
			    		var f=0;
			    		
			    		c.onload=function(h){
			    			var g='<img src="'+h.target.result+'"/>';
			    			e.getParentEditor().insertElement(CKEDITOR.dom.element.createFromHtml(g));
			    			f++;
			    			if(f<d.length){
			    				c.readAsDataURL(d[f]);
			    			}
			    		};
			    		c.onerror=function(g){
			    			console.log("error",g);
			    			console.log(g.getMessage());
			    		};
			    	if(d.length>0){
			    		c.readAsDataURL(d[0]);
			    	}else{
			    		alert(a.lang.doksoft_image_embed.choose_files);
			    	}}else{
			    		alert(a.lang.doksoft_image_embed.not_supported);
			    	}},
			    	contents:[{id:"info",label:"",accessKey:"I",elements:[{type:"vbox",padding:0,children:[{type:"vbox",id:"uploadbox",align:"right",children:[{type:"html",id:"doksoft_image_embed_upload",html:'<input name="doksoft_image_embed_upload" type="file" multiple="true" class="add-border"/>'+'<!--[if IE]>\n<style type="text/css">.add-border {border: 1px solid gray !important}</style>\n<![endif]-->'}]}]}]}]};};CKEDITOR.dialog.add("doksoft_image_embed",function(a){return b(a);});})();