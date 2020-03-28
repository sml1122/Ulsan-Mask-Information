var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
	center: new kakao.maps.LatLng(35.562062, 129.337313), //지도의 중심좌표.
	level: 1 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

var array = [];
var markers = [];

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
function setMarkers(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

$( "#searching" ).click(function() {
	var send_array = Array();
	var send_cnt = 0;
	var chkbox = $(".form-check-input");
	for(i=0;i<chkbox.length;i++) {
		if (chkbox[i].checked === true){
			send_array[send_cnt] = chkbox[i].value;
			send_cnt++;
		}
	}

	var jsonData = JSON.stringify(send_array);
	jQuery.ajaxSettings.traditional = true;

	$.ajax({
		url: "mask_search/",
		type: 'post',
		data: {"gu":jsonData},
		dataType:'json',
		success: function (api_data) {
			var data = api_data['js_obj'];
			setMarkers(null);

			for(var j = 0; j < data.length; j++){
				var pharmacy_cnt = parseInt(data[j]['count']);
				var cnt = 0;
				for(var i=0; i<pharmacy_cnt; i++){
					var remain = data[j]['stores'][i]['remain_stat'];

					if(remain === "empty" || remain === "break" || remain === null){

					}
					else{
						var name = data[j]['stores'][i]['name'];
						var lat = parseFloat(data[j]['stores'][i]['lat']);
						var lng = parseFloat(data[j]['stores'][i]['lng']);
						var created = data[j]['stores'][i]['created_at'].split(" ")[1];

						var stock = "정보없음";
						if(remain === "plenty"){
							stock = "100개 이상"
						}
						else if(remain === "some"){
							stock = "30개 이상 100개 미만"
						}
						else if(remain === "few"){
							stock = "2개 이상 30개 미만"
						}
						else if(remain === "empty"){
							stock = "1개 이하"
						}
						else if(remain === "break"){
							stock = "판매중지"
						}

						array[cnt] = {
							content: "<textarea rows='3'>" + name + "\n" + stock + "\n" + "갱신시간 : " + created + "</textarea>",
							latlng: new kakao.maps.LatLng(lat, lng)
						};
						cnt++;
					}
				}

				for(var ii=0; ii<array.length; ii++){
					// 마커를 생성합니다
					var marker = new kakao.maps.Marker({
						map: map, // 마커를 표시할 지도
						position: array[ii].latlng // 마커의 위치
					});

					// 마커를 배열에 추가
					markers.push(marker);

					// 마커에 표시할 인포윈도우를 생성합니다
					var infowindow = new kakao.maps.InfoWindow({
						content: array[ii].content // 인포윈도우에 표시할 내용
					});

					// 마커에 mouseover 이벤트와 mouseout 이벤트를 등록합니다
					// 이벤트 리스너로는 클로저를 만들어 등록합니다
					// for문에서 클로저를 만들어 주지 않으면 마지막 마커에만 이벤트가 등록됩니다
					kakao.maps.event.addListener(marker, 'mouseover', makeOverListener(map, marker, infowindow));
					kakao.maps.event.addListener(marker, 'mouseout', makeOutListener(infowindow));
				}
				array.length = 0;

				// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
				function makeOverListener(map, marker, infowindow) {
					return function() {
						infowindow.open(map, marker);
					};
				}

				// 인포윈도우를 닫는 클로저를 만드는 함수입니다
				function makeOutListener(infowindow) {
					return function() {
						infowindow.close();
					};
				}
			}
		},
		error: function(){
			console.log("error");
		}
	});
});

