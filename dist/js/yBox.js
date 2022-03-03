/*! yBox - v3.0 - 03/03/2022
* By Yuval Ashkenazi
* https://github.com/yuval123123/yBox-jQuery */

//yBox
$('body').on('click','.yBox',function(e){
	e.preventDefault();
	var self = $(this);
	if(typeof beforeYboxOpen != 'undefined'){
		beforeYboxOpen(self);
	}
	$('.yBox.yBoxFocus').removeClass('yBoxFocus');
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
				
	if(!$('.yBoxFrame').length){
		$('body').append(html);
		insertPopHtml(self,hasSelf,url,code);
		setTimeout(function(){
			$('.yBoxOverlay').addClass('active');
		},200);
	}else{
		if($('.yBoxFrame.yBoxImgWrap').length){
			if($('.yBoxFramePlaceHolder').length){
				$('.yBoxFramePlaceHolder').before($('.insertYboxAjaxHere').html());
				$('.yBoxFramePlaceHolder').remove();
			}
			$('.insertYboxAjaxHere').html('');
			insertPopHtml(self,hasSelf,url,code);
		}else{
			$('.insertYboxAjaxHere').animate({
				opacity : 0
			},function(){
				var $this = $(this);
				setTimeout(function(){
					if($('.yBoxFramePlaceHolder').length){
						$('.yBoxFramePlaceHolder').before($('.insertYboxAjaxHere').html());
						$('.yBoxFramePlaceHolder').remove();
					}
					$this.html('');
					insertPopHtml(self,hasSelf,url,code);
					$('.insertYboxAjaxHere').animate({
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
			$('.yBoxFrame').addClass('yBoxIframeWrap');
			if(url.toLowerCase().indexOf('youtube') > -1 || url.toLowerCase().indexOf('youtu.be') > -1){
				var youtube_id = url.replace(/^[^v]+v.(.{11}).*/,"$1").replace('https://youtu.be/','').replace(/.*youtube.com\/embed\//,'');
				url = 'https://www.youtube.com/embed/'+youtube_id+'?wmode=transparent&rel=0&autoplay=1&hl='+yLang;
			}
			$('.yBoxFrame .insertYboxAjaxHere').html('<iframe src="'+url+'" frameborder="0" wmode="Opaque" allow="autoplay" allowfullscreen class="yBoxIframe"></iframe>');
		}else if(self.hasClass('yBox_video')){
			//video
			$('.yBoxFrame').addClass('yBoxIframeWrap');
			$('.yBoxFrame .insertYboxAjaxHere').html('<video class="yBoxVideo" autoplay controls preload plays-inline playsinline><source src="'+url+'" type="video/mp4" /></video>');
		}else if(self.hasClass('yBox_ajax')){
			//ajax
			$.get(url,function(data){
				$('.insertYboxAjaxHere').addClass('isAjax').html(data);
			});
		}else if(url.indexOf('#') == -1){
			//image
			$('.yBoxFrame').addClass('yBoxImgWrap');
			$('.insertYboxAjaxHere').append('<div style="text-align:center;position:absolute;right:0;left:0;top:0;bottom:0;"><div class="yBoxLoader"></div></div>');
			var img = new Image();
			img.src = url;
			img.className = 'yBoxImg';
			img.onload = function(){
				var group = self.data('ybox-group');
				var alt = self.data('ybox-alt') || '';
				var code = '<div class="yBoxImgZoom"><img src="'+url+'" alt="'+alt+'" class="yBoxImg" /></div>';
				if(group && $('.yBox[data-ybox-group="'+group+'"]').length > 1){
					code = '<button type="button" class="yBoxNextImg" title="'+strings.next+'"></button>'+code+'<button type="button" class="yBoxPrevImg" title="'+strings.prev+'"></button>';
				}
				$('.insertYboxAjaxHere').html(code);
				if(window.screen.width <= 767)
					zoom({zoom:'yBoxImgZoom'});
				$('.yBoxNextImg').click(function(e){
					yBoxNext(self);
				});
				$('.yBoxPrevImg').click(function(e){
					yBoxPrev(self);
				});
			};
		}else{
			$(url).after('<div class="yBoxFramePlaceHolder"></div>');
			if($('.insertYboxAjaxHere.isAjax').length){
				var yBoxHTML = '<div id="'+$(url).attr('id')+'">'+$(url).html()+'</div>';
				$('.insertYboxAjaxHere').html(yBoxHTML).removeClass('isAjax');
				//$(url).remove();
			}else{
				$(url).appendTo('.insertYboxAjaxHere');
			}
		}
		if(window.screen.width > 991){
			setTimeout(function(){
				if(self.data('focus')){
					$('.insertYboxAjaxHere .'+self.data('focus')).focus();
				}else{
					$('.insertYboxAjaxHere iframe, .insertYboxAjaxHere a, .insertYboxAjaxHere input, .insertYboxAjaxHere select:not(.select2), .insertYboxAjaxHere .select2-selection, .insertYboxAjaxHere button').first().focus();
				}
			},500);
		}
	}else{
		$('.insertYboxAjaxHere').html(code);
	}
};
function yBoxNext(self){
	var group = self.data('ybox-group');
	var next;
	var x = false;
	$('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').each(function(i){
		if(!x){
			if($(this).attr('href') == self.attr('href')){
				x = true;
				if($('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i+1).length){
					next = $('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i+1);
				}else{
					next = $('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(0);
				}
			}
		}
	});
	if(next){
		$('yBox').data('focus','');
		next.data('focus','yBoxNextImg');
		next.trigger('click');
	}
};
function yBoxPrev(self){
	var group = self.data('ybox-group');
	var prev;
	$('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').each(function(i){
		if($(this).attr('href') == self.attr('href')){
			if($('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i-1).length){
				prev = $('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(i-1);
			}else{
				var count = $('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').length;
				prev = $('.yBox[data-ybox-group="'+group+'"]:not(.swiper-slide-duplicate)').eq(count-1);
			}
		}
	});
	if(prev){
		$('yBox').data('focus','');
		prev.data('focus','yBoxPrevImg');
		prev.trigger('click');
	}
};
//Close
$('body').on('click','.yBoxOverlay',function(e){
	if(e.target.className.indexOf('yBoxOverlay yBoxRTL active') > -1 || e.target.className.indexOf('yBoxOverlay active') > -1 || e.target.className == 'closeYbox'){
		$('.yBoxOverlay').removeClass('active');
		$('.yBoxFocus').focus();
		setTimeout(function(){
			if($('.yBoxFramePlaceHolder').length){
				$('.yBoxFramePlaceHolder').before($('.insertYboxAjaxHere').html());
				$('.yBoxFramePlaceHolder').remove();
			}
			$('.yBoxOverlay').remove();
		},600);
	}
});
$('body').on('focus','.closeYboxOnFocus',function(){
	$('.closeYbox').trigger('click');
});
$(document).keyup(function(e){
	if(e.keyCode === 39){ //Prev
		yBoxPrev($('.yBox[href="'+$('.yBoxImg').attr('src')+'"]'));
	}
	if(e.keyCode === 37){ //Next
		yBoxNext($('.yBox[href="'+$('.yBoxImg').attr('src')+'"]'));
	}
	if(e.keyCode === 27){ //Esc
		$('.closeYbox').trigger('click');
	}
});