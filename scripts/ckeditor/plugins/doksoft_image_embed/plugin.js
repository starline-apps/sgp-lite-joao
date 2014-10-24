
CKEDITOR.plugins.add("doksoft_image_embed",
		{lang:["en"],
		 init:function(a){
			 
			 
			 var _wrs_toolbarName = 'toolbar_' + a.config.toolbar;
			 
				if (CKEDITOR.config[_wrs_toolbarName] != null) {
					var wirisButtonIncluded = false;
					
					for (var i = 0; i < CKEDITOR.config[_wrs_toolbarName].length; ++i) {
						if (CKEDITOR.config[_wrs_toolbarName][i].name == 'embimg') {
							if (!wirisButtonIncluded) {
								wirisButtonIncluded = true;
							}
							else {
								CKEDITOR.config[_wrs_toolbarName].splice(i, 1);
								i--;
							}
						}
					}
				}
		   		 
			 if(typeof a.lang.doksoft_image_embed.doksoft_image_embed!="undefined") {
				 a.lang.doksoft_image_embed=a.lang.doksoft_image_embed.doksoft_image_embed;
			}
					
			
			var b=a.addCommand("doksoft_image_embed",new CKEDITOR.dialogCommand("doksoft_image_embed"));
			b.modes={wysiwyg:1,source:0};
			b.canUndo=true;
			b.addParam="image";
			if(CKEDITOR.version.charAt(0)=="4"){
				a.ui.addButton("doksoft_image_embed",
				{label:a.lang.doksoft_image_embed.button_label,
				 command:"doksoft_image_embed",
				 icon:this.path+"doksoft_image_embed_4.png"});
			}else{
				a.ui.addButton("doksoft_image_embed",
				{label:a.lang.doksoft_image_embed.button_label,
				 command:"doksoft_image_embed",
				 icon:this.path+"doksoft_image_embed.png"});
			}
			CKEDITOR.dialog.add("doksoft_image_embed",this.path+"dlg.js");
	    
		}
	  
	}
);
