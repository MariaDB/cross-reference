from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response

# Create your views here.
from django.http import HttpResponse

from .models import select_test_failures, TestFailure
from .serializers import TestFailureSerializer, APIQueryParamsSerializer


def index(request):
    available_filters = [
        "branch",
        "revision",
        "platform",
        "dt",
        "bbnum",
        "typ",
        "info",
        "test_name",
        "test_variant",
        "info_text",
        "failure_text",
        "limit",
    ]

    if request.method == "GET":
        qd = request.GET
    elif request.method == "POST":
        qd = request.POST

    if qd == {}:
        return render(request, "cr/index.html", {})

    all_failures_list = select_test_failures(qd)

    context = all_failures_list

    for f in available_filters:
        if f in qd:
            context[f] = qd[f]

    return render(request, "cr/index.html", context)


class TestFailureViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TestFailureSerializer
    expected_filters = [
        "branch",
        "revision",
        "platform",
        "dt",
        "bbnum",
        "typ",
        "info",
        "test_name",
        "test_variant",
        "info_text",
        "failure_text",
        "limit",
    ]

    def get_queryset(self):
        # Return an empty queryset here; we'll handle filtering in `list()`
        return TestFailure.objects.none()

    def list(self, request, *args, **kwargs):
        filterset = APIQueryParamsSerializer(data=request.query_params)
        filterset.is_valid(raise_exception=True)
        filters = filterset.validated_data

        # mimic frontend so that "select_test_failures" works correctly
        # i.e. sending keys with empty string values for missing filters
        for key in self.expected_filters:
            if key not in filters:
                filters[key] = ""
        test_failures = select_test_failures(filters)
        serializer = TestFailureSerializer(test_failures["test_runs"], many=True)
        return Response(serializer.data)


def health_check(request):
    # Check the db connection by performing a simple query
    try:
        TestFailure.objects.using('buildbot').exists()
        return HttpResponse("OK", status=200)
    except Exception:
        return HttpResponse("Database connection error", status=500)