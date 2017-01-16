
var citylistObj = Object.create(addressObj);

var citylistObj = $.extend(citylistObj,{
	namr:'城市选择页',
	dom: $('#citylist'),
	init:function(){
		this.baiduCity();
		this.bindEvent();
		
	},
	// 百度城市id对应关系
	baiduCity:function(){
		var _this = this;
		$.ajax({
			url:'/waimai?qt=getcitylist&format=1&t=1483686354642',
			dataType:'json',
			success:function(res){
				
				// 建立城市id对应关系
				var arr = [];
				var list = res.result.city_list;
				for(var i in list){
					arr = arr.concat(list[i]);
				}
				_this.json = {};
				for(var i in arr){
					_this.json[arr[i].name] = arr[i].code;
				}

				// 保证多个ajax请求的加载顺序，写在回调里。
				_this.hotCity();
				_this.grounpLoad();
			},
			error:function(){
				console.log('获取数据失败');
			}
		});

	},
	// 热门城市部分
	hotCity:function(){
		var _this = this;
		$.ajax({
			url:'/v1/cities',
			data:{
				'type':'hot'
			},
			type:'GET',
			success:function(res){
				// console.log(res);
				var html = '';
				for(var i = 0; i < res.length; i++){
					var cname = encodeURI(res[i].name);		//地址栏中不能出现汉字，先将城市转码。
					html += '<li><a href="#address-'+ cname +'-'+ res[i].id +'-'+ _this.json[res[i].name] +'">'+ res[i].name +'</a></li>';
				}
				$('.hc_list').html(html);
			}
		});
	},
	// 城市索引
	cityIndex:function(array){

		var str = '';

		for(var i = 0; i < array.length; i++){

			str += '<li><a href="javascript:;">'+ array[i] +'</a></li>';

		}

		$('.citys_index .item_list').html(str);

	},
	bindEvent:function(){

		$('.citys_index').on('click','li a',function(){

			var selector = "[data-id='"+ $(this).html() +"']";

			var oH = $(selector).offset().top;	

			// 页面高度不能设置成100%。
			window.scrollTo(0,oH);
		});

	},
	// 城市组里的城市列表
	grounpList:function(data){
		var str = '';
		for(var j = 0; j < data.length; j++){
			var cname = encodeURI(data[j].name);	
			str += '<li><a href="#address-'+ cname +'-'+ data[j].id +'-'+ this.json[data[j].name] +'">'+ data[j].name +'</a></li>';
		}
		return str;
	},
	// 城市组部分
	grounpLoad:function(){
		var _this = this;
		$.ajax({
			url:'/v1/cities',
			data:{
				'type':'group'
			},
			type:'GET',
			success:function(res){			
			// 先将数据的key值，放入一个空数组中。
				var arr = [];
				$.each(res,function(i,val){
					//arr.push([i,val]);
					arr.push(i);

				});
			// 对key值数组进行排序
				arr.sort();

				_this.cityIndex(arr);
			// 结构数据生成
				var html = '';
				for(var i = 0; i < arr.length; i++){

					html += '<div class="item" data-id="'+ arr[i] +'">\
								<h2>'+ arr[i] +'</h2>\
								<ul class="item_list">'+ _this.grounpList(res[arr[i]]) +'</ul>\
							</div>';	
				}
				$('.citys').append(html);
			}
		});
	}
})

// console.log(citylistObj);