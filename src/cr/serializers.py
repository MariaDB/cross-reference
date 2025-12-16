from datetime import datetime
from rest_framework import serializers
from cr.models import TestFailure


class TestFailureSerializer(serializers.ModelSerializer):
    builder_name = serializers.CharField(source="test_run_id.platform", read_only=True)
    commit = serializers.CharField(source="test_run_id.revision", read_only=True)
    branch = serializers.CharField(source="test_run_id.branch", read_only=True)

    class Meta:
        model = TestFailure
        read_only_fields = [field.name for field in model._meta.fields]
        exclude = ["test_run_id"]


class APIQueryParamsSerializer(serializers.Serializer):
    branch = serializers.CharField(required=False, max_length=100)
    commit = serializers.CharField(required=False, max_length=100, source="revision")

    builder_name = serializers.CharField(
        required=False, max_length=100, source="platform"
    )

    start_date = serializers.CharField(required=False, source="dt")

    test_type = serializers.CharField(required=False, max_length=100, source="typ")

    test_name = serializers.CharField(required=False, max_length=255)
    test_variant = serializers.CharField(required=False, max_length=255)
    limit = serializers.IntegerField(required=False, min_value=1, max_value=200)

    def validate_start_date(self, value):
        """
        Ensure start_date is a valid datetime string in one of the allowed formats.
        """
        allowed_formats = ("%Y-%m-%d", "%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S")
        for fmt in allowed_formats:
            try:
                datetime.strptime(value, fmt)
                return value  # Valid format, keep as string
            except ValueError:
                continue
        raise serializers.ValidationError(
            "Invalid start_date format. Use one of: YYYY-MM-DD, YYYY-MM-DDTHH:MM, or YYYY-MM-DD HH:MM:SS."
        )
