import debug_toolbar

from django.conf import settings
from django.urls import path, include
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register(r"testfailures", views.TestFailureViewSet, basename="testfailures")

urlpatterns = [
    path("", views.index, name="index"),
    path("api/", include(router.urls)),
]

# Debug toolbar URLs
if settings.DEBUG:
    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    
# Health check endpoint
urlpatterns += [path("health/", views.health_check, name="health_check")]
