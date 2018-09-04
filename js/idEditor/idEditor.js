/* 
* Id Editor Plugin
* Trasforma un'area di testo o una textfield in un editor di testo 'ricco'. 
* Esempio di applicazione $(selettore).ideditor(options).
*/
(function ($) {
	$.fn.ideditor = function (options) {
		var defaults = {
			editorWidth     : 0, //Larghezza area di testo
			editorHeight    : 0, //Altezza area di testo
			editorText      : "", //Testo da mostrare 
			editorFont      : "Verdana", //Font di default
			commandPosition : "right", //Posizione della barra degli strumenti (top, right, bottom, left)
			closeAll 		: true //Indica se quando si apre una toolsBar si chiudono le altre (true) oppure no (false) **da implementare
		};
		
		options = $.extend(defaults, options);
		
		//Inserisco il css nella pagina web
		$("head").append('<link type="text/css" rel="stylesheet" href="js/idEditor/css/idEditor.css" />');
		
		//Ottengo le dimensioni se non sono state risettate dall'utente
		if(options.editorHeight == 0) {
			options.editorHeight = parseInt(this.css("height").replace("px", "")) + 10;
		}
		
		if(options.editorWidth == 0) {
			options.editorWidth = parseInt(this.css("width").replace("px", ""));
		}
		
		//alert(options.editorWidth + ", " + options.editorHeight);
		
		//Ottengo la posizione dell'oggetto
		var positionLeft = $(this).offset().left + "px";
		var positionTop = $(this).offset().top + "px";
		
		//alert("Posizione " + $(this).attr("id") + ": left " + positionLeft + ", top " +  positionTop);
		
		//Creo l'iframe per l'editor
		var rteArea = "<iframe id='editorWindow-" + $(this).attr("id") + "' style='width:"+options.editorWidth + "px" +"; height:"+options.editorHeight + "px" + "; top: "+positionTop+"; left: "+positionLeft+";' class='rteField'></iframe>";
		
		//alert(rteArea);
		
		//Ottengo l'elemeneto contenitore del campo di testo
		var content = $(this).parent();
		
		//Inserisco l'iframe
		content.append(rteArea);
		
		//Nascondo i campi di testo sostituiti dall'iFrame
		$(this).hideElement($(this));
		
		//Applico il border radius
		$('#editorWindow-' + $(this).attr("id")).css({
			borderTopLeftRadius: 3, 
			borderTopRightRadius: 3, 
			borderBottomLeftRadius: 3, 
			borderBottomRightRadius: 3 
		})
		
		//Trova modo di rendere l'iFrame editabile
		var body_document = $('#editorWindow-' + $(this).attr("id")).contents().get(0);
		body_document.open();
		//Per scrivere qualcosa dentro
		body_document.write(options.editorText);
		body_document.close();
		body_document.designMode = 'on';
		
		//Imposto il font scelto come default
		doRichEditCommand('editorWindow-' + $(this).attr("id"), 'fontName', options.editorFont);
		
		//Creo la barra degli strumenti
		var toolsBar = '<div class="toolsBar" id="toolsBar'+ $(this).attr("id") +'">'
		+ '<img src="js/idEditor/commandIcon/boldIcon.png" width="40" height="34" alt="bold icon" class="commandButton"  data-command="bold" data-arg="" />'
		+ '<img src="js/idEditor/commandIcon/italicIcon.png" width="40" height="34" alt="bold icon" class="commandButton"  data-command="italic" data-arg="" />'
		+ '<img src="js/idEditor/commandIcon/underlineIcon.png" width="40" height="34" alt="bold icon" class="commandButton"  data-command="underline" data-arg="" />'
		+ '<img src="js/idEditor/commandIcon/orderedlistIcon.png" width="40" height="34" alt="bold icon" class="commandButton"  data-command="insertOrderedList" data-arg="" />'
		+ '<img src="js/idEditor/commandIcon/unorderedlistIcon.png" width="40" height="34" alt="bold icon" class="commandButton"  data-command="insertUnorderedList" data-arg="" />'
		+ '<img src="js/idEditor/commandIcon/linkIcon.png" width="40" height="34" alt="bold icon" class="commandButton"  data-command="createLink" data-arg="link" />'
		+ '<img src="js/idEditor/commandIcon/unlinkIcon.png" width="40" height="34" alt="bold icon" class="commandButton"  data-command="unlink" data-arg="" />'
		+ '<img src="js/idEditor/commandIcon/closeIcon.png" width="40" height="34" alt="bold icon" data-command="unlink" data-arg="" class="closeTools"/>'
		+ '</div>';
		
		//Al click sulla l'area di testo appaiono i comandi
		var idToolsBar = "#toolsBar"+ $(this).attr("id");
		var textArea = document.getElementById('editorWindow-' + $(this).attr("id")).contentWindow; //***Con opera non funziona
		
		var visibleTools = 0; //Se gli strumenti sono gia attivi (0 no, 1 sì)
		
		textArea.onclick = function(){
			/*if(options.closeAll) {
				$(".toolsBar").remove();
			}*/
				
			if(visibleTools == 0)
			{
				visibleTools = 1;
				$("body").append(toolsBar);
				//Posiziono toolsbar
				var posTop = parseInt(positionTop.replace("px", ""));
				var posLeft = parseInt(positionLeft.replace("px", ""));
				//Posizione della toolsBar
				
				switch (options.commandPosition) {
					
					//Posizione a destra
					case "right":
						posLeft = posLeft + options.editorWidth;
						break;
						
					//Posizione in alto
					case "top":
					
						posTop = posTop-32;
						posLeft = posLeft + (options.editorWidth/2) - 97;
						break;
						
					//Posizione in basso	
					case "bottom":
						posTop = posTop + 5 + options.editorHeight;
						posLeft = posLeft + (options.editorWidth/2) - 97;
						break;
						
					//Posizione a sinistra	
					case "left":
						posLeft = posLeft-195;
						break;
						
					//Default posizionato in alto
					default:
						posTop = posTop-32;
						posLeft = posLeft + (options.editorWidth/2) - 97;
						break;
				}
			
				$(idToolsBar).css({
					"position" : "absolute",
					"top" : posTop + "px",
					"left" : posLeft + 10 + "px"
				});
			}
		};
		
		//Click su uno strumento
		var idTextArea = $(this).attr("id")
		$(".commandButton").live("click", function() {
			var arg = $(this).attr("data-arg");
			var command = $(this).attr("data-command");
			if(arg == "") {
				//doRichEditCommand('editorWindow-' + $(this).attr("id"), 'fontName', options.editorFont);
				doRichEditCommand('editorWindow-' + idTextArea, command, "");
			}
			else if(arg == "link") {
				var linkUrl = prompt("Inserisci un url per il link", "http://");
				doRichEditCommand('editorWindow-' + idTextArea, command, linkUrl);
			}
		});
		
		//Click sul comando chiudi
		$(".closeTools").live("click", function(){
			visibleTools = 0;
			$(this).parent().remove();
		});
		
	}
}) (jQuery);


//Nasconde gli elementi obj
(function ($) {
	$.fn.hideElement = function (obj) {
		$(obj).css({
			//"height"  : "0px",
			"width"   : "0px",
			"margin"  : "0",
			"padding" : "0",
			"border" : "none",
			//"display" : "none"
		});
	}
}) (jQuery);

// Esegue in comando sul testo selezionato o sulla posizione del cursore nel testo nell'areaTesto specificata specificato
function doRichEditCommand(textArea, aName, aArg){
  //execCommand(Stringa nomeComando, Booleano mostraUIPredefinita, Stringa valoreArgomento)
  //nomeComando: vedere documento per lista comandi
  // valoreArgomento: argomento ulteriore quando richiesto, ad esempio per inserire le immagini è necessario il percorso
  getIFrameDocument(textArea).execCommand(aName,false, aArg);
  document.getElementById(textArea).contentWindow.focus()
}

//Ottinene l'id di un campo testo
function getIFrameDocument(aID){
  // se esiste contentDocument, W3C compliant (Mozilla)
  if (document.getElementById(aID).contentDocument){
    return document.getElementById(aID).contentDocument;
  } else {
    // Se si utilizza internet explore versione 6 o inferiore
    return document.frames[aID].document;
  }
}