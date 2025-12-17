# Test Failures API Documentation

This API provides access to the Buildbot test failure data. You can filter results using query parameters to retrieve specific test failures.

## Base URL

```
cr/api/testfailures/
```

## Health check

`/cr/health`

- returns 200 OK if the database is reachable
- returns 500 otherwise

---

## Query Parameters

You can filter the results using the following optional query parameters:

| Parameter      | Type      | Description                                       | Notes                  |
|----------------|----------|---------------------------------------------------|-----------------------|
| `branch`       | string   | Filter by branch name                             | Max length: 100       |
| `commit`       | string   | Filter by commit hash (revision)                 | Max length: 100       |
| `builder_name` | string   | Filter by platform or builder name               | Max length: 100       |
| `start_date`   | datetime | Filter results starting from this date and time  | Format: ISO 8601      |
| `test_type`    | string   | Filter by test type                               | Max length: 100       |
| `test_name`    | string   | Filter by test name                               | Max length: 255       |
| `test_variant` | string   | Filter by test variant                            | Max length: 255       |
| `limit`        | integer  | Limit the number of results returned             | Min: 1, Max: 200      |

---

## Example Requests

### Get all test failures
```
GET cr/api/testfailures/
```

### Filter by branch and commit
```
GET cr/api/testfailures/?branch=10.11&commit=95782e5cf2dbd977473f91a59bdb47da4bf6261e
```

### Filter by builder name and test type with limit
```
GET cr/api/testfailures/?builder_name=amd64-ubasan-clang-20-debug&test_type=nm&limit=50
```

---

## Response Format

The API returns JSON `list[dict]` where each item is a unique test failure.

```json
[
    {
        "builder_name": "amd64-ubasan-clang-20-debug",
        "commit": "95782e5cf2dbd977473f91a59bdb47da4bf6261e",
        "branch": "10.11",
        "test_name": "main.sp-error",
        "test_variant": "",
        "info_text": null,
        "failure_text": "\ncreate procedure proc_36510()\nbegin\ndeclare should_be_illegal condition for 0;\ndeclare continue handler for should_be_illegal set @x=0;\nend$$\nERROR HY000: Incorrect CONDITION value: '0'\ncreate procedure proc_36510()\nbegin\ndeclare continue handler for 0 set @x=0;\nend$$\nERROR HY000: Incorrect CONDITION value: '0'\nset @old_recursion_depth = @@max_sp_recursion_depth;\nset @@max_sp_recursion_depth = 255;\ncreate procedure p1(a int)\nbegin\ndeclare continue handler for 1436 -- ER_STACK_OVERRUN_NEED_MORE\nselect 'exception';\ncall p1(a+1);\nend|\ncall p1(1);\n\n\n\t\t\t"
    },
    {
        "builder_name": "amd64-ubasan-clang-20-debug",
        "commit": "95782e5cf2dbd977473f91a59bdb47da4bf6261e",
        "branch": "10.11",
        "test_name": "roles.acl_load_mutex-5170",
        "test_variant": "",
        "info_text": null,
        "failure_text": "\ncreate user user1@localhost;\ncreate role r1 with admin user1@localhost;\ngrant all on test.* to r1;\nflush tables;\nselect 1;\n1\n1\ndrop role r1;\ndrop user user1@localhost;\nline\n==333573==ERROR: LeakSanitizer: detected memory leaks\nSUMMARY: AddressSanitizer: 456 byte(s) leaked in 2 allocation(s).\n250912 11:07:55 [ERROR] /home/buildbot/bld/sql/mariadbd got signal 6 ;\nAttempting backtrace. Include this in the bug report.\n^ Found warnings in /dev/shm/normal/16/log/mysqld.1.err\nok\n\n\n\t\t\t"
    }
]
```

---

## Usage Example (Python)

```python
import requests

BASE_URL = "https://buildbot.mariadb.org/cr/api/testfailures/"

params = {
    "branch": "main",
    "commit": "abc123",
    "limit": 10
}

response = requests.get(BASE_URL, params=params)
data = response.json()
print(data)
```

---

## Notes

- All query parameters are optional. Omitting them will return results up to a default limit of 50.    
- Dates should be provided in ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`.

---

## URL Patterns

| Path                  | Description                  |
|-----------------------|------------------------------|
| `cr/`                   | Index page                   |
| `cr/api/testfailures/`  | Test Failures API endpoint   |
