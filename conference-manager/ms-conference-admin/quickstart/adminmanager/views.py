from django.http import HttpResponse
from django.shortcuts import render

from .models import Headquarter


def index(request):
    return HttpResponse("Conference Admin Manager")


def headquarter_list(request):
    headquarters = Headquarter.objects.all()
    return render(request, 'headquarter_list.html', {'headquarters': headquarters})
