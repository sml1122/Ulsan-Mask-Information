import requests
import json
from urllib.parse import quote
from django.shortcuts import render, HttpResponse
from datetime import datetime


def check_gu_info(gu_names):
    endpoint = "https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByAddr/json?address="
    address = quote("울산광역시 ")
    gu_name = gu_names.split(",")

    js_obj = []
    for i in range(len(gu_name)):
        gu = quote(gu_name[i])
        url = endpoint + address + str(gu)
        result = requests.get(url)
        js_obj.append(result.json())
    return js_obj


def index(request):
    current_date_time = datetime.today().strftime("%Y%m%d%H%M%S")
    return render(request, './index.html', {"current_date_time": current_date_time})


def mask_search(request):
    checked_gu = request.POST.get('gu', None)
    gu_names = checked_gu.replace("[", "").replace("]", "").replace("\"", "")

    js_obj = check_gu_info(gu_names)

    context = {
        'js_obj': js_obj,
    }
    return HttpResponse(json.dumps(context), content_type="application/json")
