/*! yBox - v1.2 - 2021-07-06
* By Yuval Ashkenazi
* https://github.com/yuval123123/yBox-jQuery */

//yBox
$('body').on('click','.yBox',function(e){
	e.preventDefault();
	$('.yBox.yBoxFocus').removeClass('yBoxFocus');
	$(this).addClass('yBoxFocus');
	yBox('',$(this));
});
function yBox(code,self){
	var popupClass = '';
	var hasSelf = true;
	
	if(typeof self == 'undefined'){
		hasSelf = false;
	}
	if(hasSelf){
		popupClass = self.data('ybox-class') || '';
		var url = self.attr('href');
	}
	var html = '<div class="yBoxOverlay">\
					<div class="yBoxFrame '+popupClass+'">\
						<div class="insertYboxAjaxHere"></div>\
						<button type="button" class="closeYbox" title="Close"></button>\
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
				url = 'https://www.youtube.com/embed/'+youtube_id+'?wmode=transparent&rel=0&autoplay=1';
			}
			$('.yBoxFrame .insertYboxAjaxHere').html('<iframe src="'+url+'" frameborder="0" wmode="Opaque" allow="autoplay" allowfullscreen class="yBoxIframe"></iframe>');
		}else if(self.hasClass('yBox_ajax')){
			//ajax
			$.get(url,function(data){
				$('.insertYboxAjaxHere').html(data);
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
					code = '<button type="button" class="yBoxNextImg" title="Next"></button>'+code+'<button type="button" class="yBoxPrevImg" title="Prev"></button>';
				}
				$('.insertYboxAjaxHere').html(code);
				if(window.screen.width <= 767)
					zoom({zoom:'yBoxImgZoom'});
				$('.yBoxNextImg').click(function(e){
					myNextPopup(self);
				});
				$('.yBoxPrevImg').click(function(e){
					myPrevPopup(self);
				});
			};
		}else{
			$(url).after('<div class="yBoxFramePlaceHolder"></div>');
			$(url).appendTo('.insertYboxAjaxHere');
		}
	}else{
		$('.insertYboxAjaxHere').html(code);
	}
	setTimeout(function(){
		if(self.data('focus')){
			$('.insertYboxAjaxHere .'+self.data('focus')).focus();
		}else{
			$('.insertYboxAjaxHere a, .insertYboxAjaxHere input, .insertYboxAjaxHere select:not(.select2), .insertYboxAjaxHere .select2-selection, .insertYboxAjaxHere button').first().focus();
		}
	},500);
};
function myNextPopup(self){
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
function myPrevPopup(self){
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
	if(e.target.className == 'yBoxOverlay active' || e.target.className == 'closeYbox'){
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
$(document).keyup(function(e){
	if(e.keyCode === 39){ //Prev
		myPrevPopup($('.yBox[href="'+$('.yBoxImg').attr('src')+'"]'));
	}
	if(e.keyCode === 37){ //Next
		myNextPopup($('.yBox[href="'+$('.yBoxImg').attr('src')+'"]'));
	}
	if(e.keyCode === 27){ //Esc
		$('.closeYbox').trigger('click');
	}
});