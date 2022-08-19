/*! yBox - v3.4 - 19/08/2022
* By Yuval Ashkenazi
* https://github.com/yuvalAshkenaz/yBox */

//yBox
jQuery('body').on('click','.yBox',function(e){
	e.preventDefault();
	e.stopPropagation();
	var self = jQuery(this);
	if(typeof beforeYboxOpen != 'undefined'){
		beforeYboxOpen(self);
	}
	jQuery('.yBox.yBoxFocus').removeClass('yBoxFocus');
	self.addClass('yBoxFocus');
	yBox('',self);
	if(typeof yBoxIsOpen != 'undefined'){
		yBoxIsOpen(self);
	}
});
var yUrl = new URL(document.currentScript.src);
var yLang = yUrl.searchParams.get("lang");
var strings = {
	close	: 'Close',
	next	: 'Next',
	prev	: 'Prev'
};
if(yLang == 'he' || yLang == 'he-IL'){
	yLang = 'he';
	strings = {
		close	: 'סגירה',
		next	: 'הבא',
		prev	: 'הקודם'
	};
}

var url = new URL(window.location.href);
var systemMessage = url.searchParams.get("systemmessage");
if(systemMessage){
	yBox(systemMessage,false,'yBoxContentFrame');
	setTimeout(function(){
		//***** Remove systemmessage from URL ***********
		var params = new URLSearchParams(window.location.search);
		params.delete('systemmessage');
		if(params.toString()){
			params = '?'+params.toString();
		}
		var newURL = window.location.pathname+params;
		window.history.pushState("", "", newURL);
	},500);
}
function yBox(code,self,yBoxClass){
	var hasSelf = true;
	
	if(typeof yBoxClass == 'undefined'){
		var yBoxClass = '';
	}
	if(typeof self == 'undefined' || !self){
		hasSelf = false;
	}
	if(hasSelf){
		yBoxClass = self.data('ybox-class') || '';
		var url = self.attr('href');
	}
	var html = '<div class="yBoxOverlay'+(yLang=='he'?' yBoxRTL':'')+'">\
					<div class="yBoxFrame '+yBoxClass+'">\
						<button type="button" class="closeYboxOnFocus"></button>\
						<div class="insertYboxAjaxHere" tabindex="0"></div>\
						<button type="button" class="closeYbox" title="'+strings.close+'"></button>\
						<button type="button" class="closeYboxOnFocus"></button>\
					</div>\
				</div>';
				
	if(!jQuery('.yBoxFrame').length){
		jQuery('body').append(html);
		insertPopHtml(self,hasSelf,url,code);
		setTimeout(function(){
			jQuery('.yBoxOverlay').addClass('active');
		},200);
	}else{
		if(jQuery('.yBoxFrame.yBoxImgWrap').length){
			if(jQuery('.yBoxFramePlaceHolder').length){
				jQuery('.yBoxFramePlaceHolder').before(jQuery('.insertYboxAjaxHere').html());
				jQuery('.yBoxFramePlaceHolder').remove();
			}
			jQuery('.insertYboxAjaxHere').html('');
			insertPopHtml(self,hasSelf,url,code);
		}else{
			jQuery('.insertYboxAjaxHere').animate({
				opacity : 0
			},function(){
				var jQuerythis = jQuery(this);
				setTimeout(function(){
					if(jQuery('.yBoxFramePlaceHolder').length){
						jQuery('.yBoxFramePlaceHolder').before(jQuery('.insertYboxAjaxHere').html());
						jQuery('.yBoxFramePlaceHolder').remove();
					}
					jQuerythis.html('');
					insertPopHtml(self,hasSelf,url,code);
					jQuery('.insertYboxAjaxHere').animate({
						opacity : 1
					});
				},200);
			});
		}
	}
};
function insertPopHtml(self,hasSelf,url,code){
	if(hasSelf){
		if(self.hasClass('yBox_iframe')){
			//iframe
			jQuery('.yBoxFrame').addClass('yBoxIframeWrap');
			if(url.toLowerCase().indexOf('youtube') > -1 || url.toLowerCase().indexOf('youtu.be') > -1){
				var youtube_id = url.replace(/^[^v]+v.(.{11}).*/,"$1").replace('https://youtu.be/','').replace(/.*youtube.com\/embed\//,'');
				url = 'https://www.youtube.com/embed/'+youtube_id+'?wmode=transparent&rel=0&autoplay=1&hl='+yLang;
			}
			if(url.toLowerCase().indexOf('vimeo') > -1){
				var vimeoID = url.replace(/[^0-9]/g,'');
				url = 'https://player.vimeo.com/video/'+vimeoID+'?autoplay=1';
			}
			jQuery('.yBoxFrame .insertYboxAjaxHere').html('<iframe src="'+url+'" frameborder="0" wmode="Opaque" allow="autoplay" allowfullscreen class="yBoxIframe"></iframe>');
		}else if(self.hasClass('yBox_video')){
			//video
			jQuery('.yBoxFrame').addClass('yBoxIframeWrap');
			jQuery('.yBoxFrame .insertYboxAjaxHere').html('<video class="yBoxVideo" autoplay controls preload plays-inline playsinline><source src="'+url+'" type="video/mp4" /></video>');
		}else if(self.hasClass('yBox_ajax')){
			//ajax
			jQuery.get(url,function(data){
				jQuery('.insertYboxAjaxHere').addClass('isAjax').html(data);
			});
		}else if(url.indexOf('#') == -1){
			//image
			jQuery('.yBoxFrame').addClass('yBoxImgWrap');
			jQuery('.insertYboxAjaxHere').append('<div style="text-align:center;position:absolute;right:0;left:0;top:0;bottom:0;"><div class="yBoxLoader"></div></div>');
			var img = new Image();
			img.src = url;
			img.className = 'yBoxImg';
			img.onload = function(){
				var group = self.data('ybox-group');
				var alt = self.data('ybox-alt') || '';
				var code = '<div class="yBoxImgZoom"><img src="'+url+'" alt="'+alt+'" class="yBoxImg" /></div>';
				if(group && jQuery('.yBox[data-ybox-group="'+group+'"]').length > 1){
					code = '<button type="button" class="yBoxNextImg" title="'+strings.next+'"></button>'+code+'<button type="button" class="yBoxPrevImg" title="'+strings.prev+'"></button>';
				}
				jQuery('.insertYboxAjaxHere').html(code);
				if(window.screen.width <= 767)
					zoom({zoom:'yBoxImgZoom'});
				jQuery('.yBoxNextImg').click(function(e){
					yBoxNext(self);
				});
				jQuery('.yBoxPrevImg').click(function(e){
					yBoxPrev(self);
				});
			};
		}else{
			jQuery(url).after('<div class="yBoxFramePlaceHolder"></div>');
			if(jQuery('.insertYboxAjaxHere.isAjax').length){
				var yBoxHTML = '<div id="'+jQuery(url).attr('id')+'">'+jQuery(url).html()+'</div>';
				jQuery('.insertYboxAjaxHere').html(yBoxHTML).removeClass('isAjax');
				//jQuery(url).remove();
			}else{
				jQuery(url).appendTo('.insertYboxAjaxHere');
			}
		}
		if(window.screen.width > 991){
			setTimeout(function(){
				if(self.data('focus')){
					jQuery('.insertYboxAjaxHere .'+self.data('focus')).focus();
				}else{
					jQuery('.insertYboxAjaxHere iframe, .insertYboxAjaxHere a, .insertYboxAjaxHere input, .insertYboxAjaxHere select:not(.select2), .insertYboxAjaxHere .select2-selection, .insertYboxAjaxHere button').first().focus();
				}
			},500);
		}
	}else{
		jQuery('.insertYboxAjaxHere').html(code);
	}
};
function yBoxNext(self){
	var group = self.data('ybox-group');
	var next;
	var x = false;
	jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').each(function(i){
		if(!x){
			if(jQuery(this).attr('href') == self.attr('href')){
				x = true;
				if(jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i+1).length){
					next = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i+1);
				}else{
					next = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(0);
				}
			}
		}
	});
	if(next){
		jQuery('yBox').data('focus','');
		next.data('focus','yBoxNextImg');
		next.trigger('click');
	}
};
function yBoxPrev(self){
	var group = self.data('ybox-group');
	var prev;
	jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').each(function(i){
		if(jQuery(this).attr('href') == self.attr('href')){
			if(jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i-1).length){
				prev = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i-1);
			}else{
				var count = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').length;
				prev = jQuery('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(count-1);
			}
		}
	});
	if(prev){
		jQuery('yBox').data('focus','');
		prev.data('focus','yBoxPrevImg');
		prev.trigger('click');
	}
};
//Close
jQuery('body').on('click','.yBoxOverlay',function(e){
	if(e.target.className.indexOf('yBoxOverlay yBoxRTL active') > -1 || e.target.className.indexOf('yBoxOverlay active') > -1 || e.target.className == 'closeYbox'){
		if(typeof beforeYboxClose != 'undefined'){
			var beforeClose = beforeYboxClose($('.yBox.yBoxFocus'));
			if(beforeClose == false)
				return false;
		}
		jQuery('.yBoxOverlay').removeClass('active');
		jQuery('.yBoxFocus').focus();
		setTimeout(function(){
			if(jQuery('.yBoxFramePlaceHolder').length){
				jQuery('.yBoxFramePlaceHolder').before(jQuery('.insertYboxAjaxHere').html());
				jQuery('.yBoxFramePlaceHolder').remove();
			}
			jQuery('.yBoxOverlay').remove();
			if(typeof afterYboxClose != 'undefined'){
				afterYboxClose($('.yBox.yBoxFocus'));
			}
		},600);
	}
});
jQuery('body').on('focus','.closeYboxOnFocus',function(){
	jQuery('.closeYbox').trigger('click');
});
jQuery(document).keyup(function(e){
	if(e.keyCode === 39){ //Prev
		yBoxPrev(jQuery('.yBox[href="'+jQuery('.yBoxImg').attr('src')+'"]'));
	}
	if(e.keyCode === 37){ //Next
		yBoxNext(jQuery('.yBox[href="'+jQuery('.yBoxImg').attr('src')+'"]'));
	}
	if(e.keyCode === 27){ //Esc
		jQuery('.closeYbox').trigger('click');
	}
});