var rlistObj = Object.create(addressObj);

var rlistObj = $.extend(rlistObj,{
	namr:'餐厅列表页',
	dom: $('#rlist'),
	init:function(){

		// 加载完banner部分，在加载商家列表
				// this.coordinate();

	},

	// 当离开本页面，让滚动事件解除
	leave:function(){

		this.dom.hide();

		$(window).unbind('scroll');

	},
	// 加载banner部分
	load_banner:function(){

		var _this = this;

		$.ajax({

			url:'/v2/index_entry?geohash=wtw3sz12gtp&group_type=1&flags=[F]',
			success:function(res){

				_this.num = Math.ceil(res.length / 8);

				_this.clientWidth = $(window).width() ;

				$('.banner-cons').width(_this.clientWidth * _this.num+ 'px');

				var str = '';

				var str1 = '';

				for(var i = 0; i < _this.num; i++){

					str += '<li class="bc-item">';

					for(var j = i*8; j < (i+1)*8; j++){

						if(j < res.length){
							str += '<a class="bl-item" href="javascript:;"> \
									<div class="bl-item-img">\
										<img src="//fuss10.elemecdn.com'+ res[j].image_url +'?imageMogr/format/webp/" alt="">\
									</div>\
									<span class="bl-item-txt">'+ res[j].title +'</span>\
								</a>';
						}
					}

					str += '</li>';

					if(i ==0 ){
						str1 += '<li class="active"></li>';
					}
					else{
						str1 += '<li></li>';
					}
				}
				$('.banner-cons').html(str);
				$('.banner-index').html(str1);

			
			// 滑动banner事件	
				_this.banner_change();
			},
			error:function(){

				console.log('获取数据错误');
			}

		});

	},
	// 滑动banner事件	
	banner_change:function(){

		var _this = this;

		this.page = 0;

		$('.banner-cons').on('touchstart',function(event){

			var event = window.event || event;
			var touch = event.touches[0];

			var startX = touch.clientX;
			var startY = touch.clientY;

			_this.banX = $('.banner-cons').position().left;

			$('.banner-cons').on('touchmove',function(event){
				var event = window.event || event;
				var touch = event.touches[0];

				_this.moveX = touch.clientX;
				var moveY = touch.clientY; 

				_this.disX = _this.moveX - startX;
 
				_this.moveLeft = _this.disX + _this.banX;

				if(_this.moveLeft > 0){
					_this.moveLeft = 0;
				}
				else if (_this.moveLeft < -_this.clientWidth){
					_this.moveLeft = -_this.clientWidth;
				}

				$(this).css('left', _this.moveLeft + 'px');

			});

			$('.banner-cons').on('touchend',function(event){

			// 对滑动距离进行判断，然后进行处理
				if(_this.disX < -_this.clientWidth/3){

					_this.page += 1;

					console.log(_this.num-1);

					_this.page = _this.page > _this.num-1 ? _this.num-1 : _this.page;

					

				}
				else if (_this.disX > _this.clientWidth/3){

					_this.page -= 1;

					_this.page = _this.page < 0 ? 0 : _this.page;

				}

				_this.moveLeft = -_this.page*_this.clientWidth;

			// 样式更新	
				$('.banner-index').children('li').eq(_this.page).addClass('active').siblings().removeClass('active');

				$('.banner-cons').animate({'left': _this.moveLeft + 'px'});

			});

		});

	},
	// 获取坐标
	coordinate:function(){
		// console.log(location.hash,location.hash.split['-']);

		var _this = this;

		this.index = 0;

		var urlval = location.hash.split('-')[1];

		var locObj =JSON.parse(Store('coo'));

		// console.log(typeof locObj);

		if(locObj){

			this.load_banner();
			this.loadSj(locObj);

			return;
		}

		$.ajax({
			url:'/v1/pois/' + urlval,
			type:'GET',
			success:function(res){

				locObj = {
					lat:res.latitude,
					lon:res.longitude
				};

				Store('coo',locObj);

				_this.load_banner();
				_this.loadSj(locObj);

			},
			error:function(){
				console.log('获取数据失败');
			}
		});
	},
	// 加载商家列表
	loadSj:function(loc,onOff){

		var _this = this;

		loc = loc || JSON.parse(Store('coo'));

		// console.log(!flag);   //undefined 去反是true。
		// 进行判断，是否需要清空列表
		if(!!onOff == false){

			$('.rl-item-list').html('');
		}

		$.ajax({
			url:'/shopping/restaurants',
			data:{
				latitude:loc.lat,
				longitude:loc.lon,
				offset:_this.index,
				limit:20,
				extras:'[activities]'
			},
			success:function(res){

				if(res.length < 20){

					$('.more p').html('没有更多商家了');
				}
				else{

					$('.more p').html('正在载入更多商家...');
				}

				var str = '';
				for(var i = 0; i < res.length; i++){

				// 图片地址处理
					var a = res[i].image_path.substring(0,1);
					var b = res[i].image_path.substring(1,3);
					var c = res[i].image_path.substring(3);
					var d = '';
					var e = '';
					if(res[i].image_path.indexOf('jpeg') != -1 ){
						d = res[i].image_path.substring(res[i].image_path.length-4);
					}
					else if(res[i].image_path.indexOf('png') != -1 ){
						d = res[i].image_path.substring(res[i].image_path.length-3);
					}
					else if(res[i].image_path.indexOf('jpg') != -1 ){
						d = res[i].image_path.substring(res[i].image_path.length-3);
					}

				// 配送费
					if(res[i].float_delivery_fee == 0){
						e = '免费配送';
					}
					else{
						e = '配送费￥<em>'+ res[i].float_delivery_fee +'</em>';
					}
				// 字符串拼接
					str += '<div class="rl-item">	\
								<div class="rl-item-l">\
									<img class="logo" src="//fuss10.elemecdn.com/'+ a +'/'+ b +'/'+ c +'.'+ d +'?imageMogr/format/webp/thumbnail/!130x130r/gravity/Center/crop/130x130/">\
								</div>\
								<div class="rl-item-r">\
									<h3>'+ res[i].name +'</h3>\
									<div class="pj">\
										<span class="star-icon">\
											<i></i>\
											<i></i>\
											<i></i>\
											<i></i>\
											<i></i>\
										</span>\
										<span class="star">'+ res[i].rating +'</span>\
										<span class="sale-mount">月售<em>'+ res[i].recent_order_num +'</em>单</span>\
									</div>\
									<p class="fy">\
										<span class="fy-l">￥<i>'+ res[i].regular_customer_count +'</i>起送/<b>'+ e +'</b></span>\
										<span class="fy-r"><i>'+ (res[i].distance/1000).toFixed(2) +'</i>km / <b><em>'+ res[i].order_lead_time +'</em>分钟</b></span>\
									</p>\
								</div>\
							</div>'
					
				}

				$('.rl-item-list').append(str);
			// 调取滑到底部事件
				_this.slideDown();
				_this.flag = true;
			},
			error:function(){
				console.log('获取数据错误');
			}
		});
	},
	// 滑到底部，更新新的商家
	slideDown:function(){
		var _this = this;
		$(window).on('scroll',function(){
			console.log('滚动事件触发')
			var clientHeight = $(window).height();//获取窗口高度
			var moreT = $(".more").offset().top;//获取滚动条高度，[0]是为了把jq对象转化为js对象
			var scrollT = $("body").scrollTop();//滚动条距离顶部的距离
			
			// console.log(clientHeight,scrollT,moreT)
			if(scrollT+clientHeight>=moreT){//当滚动条到顶部的距离等于滚动条高度减去窗口高度时
				// queryMailList();

				if(_this.flag){

					_this.flag = false;

					_this.index += 20;

					console.log(_this.index);

					_this.loadSj(null,true);
				}
			}
		});
	}
})

