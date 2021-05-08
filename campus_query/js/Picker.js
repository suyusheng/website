
var locationobj;
;(function($){
	var obj = {
		city: true,
		area: true,
		pca: ['广东','广州','越秀'],	
		pick: function(data){} //回调
    }
    locationobj = new Location();
    var location = locationobj.items;
    console.log(location);
    //var location = (new Location()).items;
	var global = {};
	var globalIndex = 0;
	var item_height = 0;
	var eventArr = {'pc': ['mousedown', 'mousemove', 'mouseup'], 'phone': ['touchstart', 'touchmove', 'touchend']};
	var eventType = 'phone';
	if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
		eventType = 'phone';
	}else{
		eventType = 'pc';
	}
	 // console.log(location)
	$.fn.Picker = function(options){
		var settings = $.extend({},obj,options);
		var Self = $(this);

		var curGlobalIndex = globalIndex++;
		global[curGlobalIndex] = {};
		global[curGlobalIndex].createOn = false;
		global[curGlobalIndex].selfOne = true;
		global[curGlobalIndex].s_time = null;
		global[curGlobalIndex].s_pageY = null;
		global[curGlobalIndex].initTransY = [];
		global[curGlobalIndex].item_height = 0;
		global[curGlobalIndex].selectVal = [];
		global[curGlobalIndex].selectId = [];
		global[curGlobalIndex].timer = {};
		global[curGlobalIndex].pcaindex = {p:1, c:2, a:2};
		global[curGlobalIndex].canInit = true;
		global[curGlobalIndex].rotate = {p: [], c: [], a: []};
		
		if(!global[curGlobalIndex].createOn) {
			createModel(settings, Self, curGlobalIndex);
			global[curGlobalIndex].createOn = true;
		}
		Self.on("click",function(){
			$("#picker-menban"+curGlobalIndex).fadeIn();
            $("#picker-model"+curGlobalIndex).addClass("move-in");
            
			setProvince($("#picker-model"+curGlobalIndex+" .picker-col-items").eq(0), curGlobalIndex);
			setCity($("#picker-model"+curGlobalIndex+" .picker-col-items").eq(1), curGlobalIndex);
			setArea($("#picker-model"+curGlobalIndex+" .picker-col-items").eq(2), curGlobalIndex);
			resetPca(curGlobalIndex)
			if(global[curGlobalIndex].canInit){
				initPca(settings.pca, curGlobalIndex)
				global[curGlobalIndex].canInit = false;
			}
		})
		$("#picker-model"+curGlobalIndex+" .choose-hook").on("click",function(){
			hidePicker();
			if($(this).hasClass("picker-sure")){
                writeVal(settings, Self, curGlobalIndex);
                console.log(global[curGlobalIndex])
				settings.pick && settings.pick(global[curGlobalIndex].pcaindex);
			}
		})
	}
	function createModel(obj, self, curGlobalIndex){
		var html = `
			<div class="picker-menban" id="picker-menban${curGlobalIndex}"></div>
			<div class="picker-model" id="picker-model${curGlobalIndex}">
				<div class="toolbar">
					<div class="toolbar-inner">
                        <div class="left"><a class="choose-hook picker-cacel">取消</a></div>
                        <div class="left"><a class="choose-hook picker-cacel">选择地区</a></div>
						<div class="right"><a class="choose-hook picker-sure">确定</a></div>
					</div>
				</div>
				<div class="picker-model-content">
					${'<div class="picker-col-items picker-col-left"><div class="picker-col-wrapper"></div></div>'}
					${obj.city ? '<div class="picker-col-items picker-col-center"><div class="picker-col-wrapper"></div></div>' : ''}
					${obj.city&&obj.area ? '<div class="picker-col-items picker-col-right"><div class="picker-col-wrapper"></div></div>' : ''}
					<div class="picker-center-highlight"></div>
					<div class="mask-top"></div>
					<div class="mask-bottom"></div>
				</div>
			</div>
		`;
		$("body").append(html);
		item_height = $("#picker-model"+curGlobalIndex+" .picker-center-highlight").outerHeight();
		$("#picker-model"+curGlobalIndex+" .picker-col-items").css("width","calc(100% / "+$("#picker-model"+curGlobalIndex+" .picker-col-items").length+")");
		$("#picker-model"+curGlobalIndex+" .picker-col-items").each(function(i, v){
			global[curGlobalIndex].initTransY.push(0);
			(function(index){
				TouchFun(v, index, obj, self, curGlobalIndex);
			})(i)
		})
	}
	function setProvince(el, curGlobalIndex){
		var p_html = '';
		var data = location[0];
		for(var i in data) {
			p_html += '<div class="picker-items" data-id="'+i+'">'+data[i]+'</div>';
		}
		$(el).find(".picker-col-wrapper").html('');
		$(el).find(".picker-col-wrapper").html(p_html);
		$(el).find(".picker-col-wrapper").css({transform:"translateY("+ Number(0) +"px)","transition":"none"});
		if(global[curGlobalIndex].canInit){
			$(el).find(".picker-items").each(function(i, v){
				if($(v).data('id') == global[curGlobalIndex].pcaindex.p){
					$(el).find(".picker-col-wrapper").css({transform:"translateY("+ -(i*item_height) +"px)","transition":"none"});
					global[curGlobalIndex].initTransY[0] = -(i*item_height);
				}
			})
		}
		setRotate("#picker-model"+curGlobalIndex+" .picker-col-left","p", curGlobalIndex)
	}
	function setCity(el, curGlobalIndex){
		var s_html = '';
		var data = location[0+','+global[curGlobalIndex].pcaindex.p];
		for(var i in data){
			s_html += '<div class="picker-items" data-id="'+i+'">'+data[i]+'</div>';
		}
		$(el).find(".picker-col-wrapper").html('');
		$(el).find(".picker-col-wrapper").html(s_html);
		$(el).find(".picker-col-wrapper").css({transform:"translateY("+ Number(0) +"px)","transition":"none"});
		if(global[curGlobalIndex].canInit){
			$(el).find(".picker-items").each(function(i, v){
				if($(v).data('id') == global[curGlobalIndex].pcaindex.c){
					$(el).find(".picker-col-wrapper").css({transform:"translateY("+ -(i*item_height) +"px)","transition":"none"});
					global[curGlobalIndex].initTransY[1] = -(i*item_height);
				}
			})
		}
		setRotate("#picker-model"+curGlobalIndex+" .picker-col-center","c", curGlobalIndex)
	}
	function setArea(el, curGlobalIndex){
		var a_html = '';
		var data = location[0+','+global[curGlobalIndex].pcaindex.p+','+global[curGlobalIndex].pcaindex.c];
		for(var i in data){
			a_html += '<div class="picker-items" data-id="'+i+'">'+data[i]+'</div>';
		}
		$(el).find(".picker-col-wrapper").html('');
		$(el).find(".picker-col-wrapper").html(a_html);
		$(el).find(".picker-col-wrapper").css({transform:"translateY("+ Number(0) +"px)","transition":"none"});
		if(global[curGlobalIndex].canInit){
			$(el).find(".picker-items").each(function(i, v){
				if($(v).data('id') == global[curGlobalIndex].pcaindex.a){
					
					$(el).find(".picker-col-wrapper").css({transform:"translateY("+ -(i*item_height) +"px)","transition":"none"});
					global[curGlobalIndex].initTransY[2] = -(i*item_height);
				}
			})
		}
		setRotate("#picker-model"+curGlobalIndex+" .picker-col-right","a", curGlobalIndex)
	}
	// 滑动事件
	function TouchFun(el, index, datalist, self, curGlobalIndex){
		var arr = ['p','c','a'];
		//开关打开
		var isDown = false;
		$(el).on(eventArr[eventType][0],function(e){
            // console.log(e.target.innerHTML)
			e.preventDefault();
			if(eventType == 'pc'){
				global[curGlobalIndex].s_pageY = e.clientY;
				s_time = e.timeStamp;
				isDown = true;
				return false;
			}
			if(e.originalEvent.changedTouches[0]){
				global[curGlobalIndex].s_pageY = e.originalEvent.changedTouches[0].clientY;
				s_time = e.timeStamp;
			}
			
		})
		$(el).on(eventArr[eventType][1],function(e){
			e.preventDefault();
			if(eventType == 'pc'){
				if(!isDown){
					return;
				}
				var distance = e.clientY - global[curGlobalIndex].s_pageY;
			}else{
				var distance = e.originalEvent.changedTouches[0].clientY - global[curGlobalIndex].s_pageY;
			}
			$(el).find(".picker-col-wrapper").css({transform:"translateY("+ Number(global[curGlobalIndex].initTransY[index]+distance) +"px)","transition":"none"})
			$(el).find(".picker-items").each(function(i,v){
				$(v).css({
					transform: "rotateX("+(global[curGlobalIndex].rotate[arr[index]][i]+distance*25/36)+"deg)",
					transition: "none"
				})
			})
		})
		$(el).on(eventArr[eventType][2],function(e){
			e.preventDefault();
			if(eventType == 'pc'){
				var distance = e.clientY - global[curGlobalIndex].s_pageY;
				isDown = false;	//开关关闭
			}else{
				var distance = e.originalEvent.changedTouches[0].clientY - global[curGlobalIndex].s_pageY;
			}
			
			var long_height = $(el).find(".picker-col-wrapper").outerHeight();
			// 求滚动初始速度
			var time_ge = (e.timeStamp - s_time);
			var v = distance / (e.timeStamp - s_time);
			if(time_ge>300){
				v = 0;
			}
			inertiaMove(v, distance, index, el, datalist, self, curGlobalIndex, long_height)

		})
	}
	// 滑动函数
	function inertiaMove(v, distance,index, el, datalist, self, curGlobalIndex, long_height){
		var arr = ['p','c','a'];
		var numm = 0;
		var out_time = v==0 ? 0.2 : 1;		//最后缓冲时间
		clearInterval(global[curGlobalIndex].timer[index]);
		function request(){
			
			distance += v*500;
			if(distance<0){
				if(Math.abs(distance)%item_height>=item_height/2){
					var yu = Math.abs(distance)%item_height;
					distance = distance-(item_height-yu)
				}else{
					var yu = Math.abs(distance)%item_height;
					distance = distance+yu
				}
			}else{
				if(Math.abs(distance)%item_height>=item_height/2){
					var yu = Math.abs(distance)%item_height;
					distance = distance+(item_height-yu)
				}else{
					var yu = Math.abs(distance)%item_height;
					distance = distance-yu
				}
			}
			var trans = Number(global[curGlobalIndex].initTransY[index]+distance);
			if(Math.abs(global[curGlobalIndex].initTransY[index]+distance) >= long_height-item_height) {
				trans = -(long_height-item_height);
				out_time = 0.2;
			}
			if(global[curGlobalIndex].initTransY[index]+distance > 0 ) {
				trans = 0;
				out_time = 0.2;
			}
			$(el).find(".picker-col-wrapper").css({transform:"translateY("+ Number(trans) +"px)", "transition": "transform "+out_time+"s ease-out"});
			global[curGlobalIndex].initTransY[index] = Number(trans);
			
			
			var num2 = Math.floor( Math.abs(trans) / $(".picker-center-highlight").eq(0).outerHeight());
			global[curGlobalIndex].rotate[arr[index]] = [];
			$(el).find(".picker-items").each(function(i,v){
				$(v).css({
					transform: "rotateX("+(i-num2)*25+"deg)",
					transition: "transform "+out_time+"s ease-out"
				})
				global[curGlobalIndex].rotate[arr[index]].push((i-num2)*25);
			})
		}
		request();
		global[curGlobalIndex].timer[index] = setTimeout(function(){
			judgeNum(global[curGlobalIndex].initTransY[index], index, el, datalist, self, curGlobalIndex)
		}, out_time*1000)
		
	}
	function judgeNum(distance, index, el, datalist, self, curGlobalIndex){
		var num = Math.abs(distance / item_height);
		var id = Number($(el).find(".picker-items").eq(num).data("id"));
		global[curGlobalIndex].selectVal[index] = id;
		global[curGlobalIndex].selectId[index] = Number($(el).find(".picker-items").eq(num).data("id"));

		if(index == 0){
			global[curGlobalIndex].pcaindex.p = id;
			datalist.city ? setCity($(el).next(), curGlobalIndex) : '';
			global[curGlobalIndex].initTransY[index+1] = 0;
			global[curGlobalIndex].pcaindex.c = $(el).next().find('.picker-items').eq(0).data('id');
			datalist.area ? setArea($(el).next().next(), curGlobalIndex) : '';
			global[curGlobalIndex].pcaindex.a = $(el).next().next().find('.picker-items').eq(0).data('id');
			global[curGlobalIndex].initTransY[index+2] = 0;
		}else if(index==1){
			global[curGlobalIndex].pcaindex.c = id;
			datalist.area ? setArea($(el).next(), curGlobalIndex): ''
			global[curGlobalIndex].pcaindex.a = $(el).next().find('.picker-items').eq(0).data('id');
			global[curGlobalIndex].initTransY[index+1] = 0;
		}else {
			global[curGlobalIndex].pcaindex.a = id;
		}
		writeVal(datalist, self, curGlobalIndex);
	}
	function setRotate(el,type, curGlobalIndex){
		var num = 0;
		global[curGlobalIndex].rotate[type] = [];
		$(el).find(".picker-items").each(function(i,v){
			if($(v).data("id") == global[curGlobalIndex].pcaindex[type]){
				num = i;
			}
		})
		$(el).find(".picker-items").each(function(i,v){
			$(v).css({
				transform: "rotateX("+(i-num)*25+"deg)",
				transition: 'none'
			})
			global[curGlobalIndex].rotate[type].push((i-num)*25);
		})
	}
	function resetPca(curGlobalIndex){
		$.each(global[curGlobalIndex].initTransY, function(i, v){
			$("#picker-model"+curGlobalIndex).find('.picker-col-items').eq(i).find('.picker-col-wrapper').css('transform', 'translateY('+v+'px)')
		})
	}
	function initPca(data, curGlobalIndex) {
		var num = 0, countindex=0,current_id=[];
		var para = '0';
		function getid(){
			for(var index in location[para]){
				if(location[para][index].indexOf(data[countindex])== -1){
					num++;
				}else{
					current_id.push(index);
					break;
				}
			}
			if(countindex<data.length){			
				para += ','+current_id[countindex]
				countindex++;
				getid();
			}
		}
		getid();
		global[curGlobalIndex].pcaindex.p = current_id[0];
		global[curGlobalIndex].pcaindex.c = current_id[1];
		global[curGlobalIndex].pcaindex.a = current_id[2];
		setProvince($("#picker-model"+curGlobalIndex+" .picker-col-items").eq(0), curGlobalIndex);
		setCity($("#picker-model"+curGlobalIndex+" .picker-col-items").eq(1), curGlobalIndex);
		setArea($("#picker-model"+curGlobalIndex+" .picker-col-items").eq(2), curGlobalIndex);
	}
	
	function writeVal(data, el, curGlobalIndex){
		var text = '';
		text = `${location['0'][global[curGlobalIndex].pcaindex.p]}  ${global[curGlobalIndex].pcaindex.c ? location['0,'+global[curGlobalIndex].pcaindex.p][global[curGlobalIndex].pcaindex.c] : ''}  ${global[curGlobalIndex].pcaindex.a ? location['0,'+global[curGlobalIndex].pcaindex.p+','+global[curGlobalIndex].pcaindex.c][global[curGlobalIndex].pcaindex.a] : ''}`;
		$(el).val(text);
		if(el[0].nodeName != 'INPUT'&&'TEXTAREA'){
			$(el).text(text)
		}
	}

	function hidePicker(){
		$(".picker-model").removeClass("move-in");
		$(".picker-menban").fadeOut();
    }

})(jQuery)
