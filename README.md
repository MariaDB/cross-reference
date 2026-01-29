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


## Filtering

The same filter semantics apply whether the user submits the fields via the GUI or via the API.  
All inputs are treated as **strings**; an empty string (or `null`) means “ignore this field”.

### Branch (`filters.branch`)
Backed by `test_run_id__branch`.

Supported inputs:

1. **Exact match (special syntax)**
   - Input: `=branch_name`
   - Lookup: `branch__exact`
   - Example: `=10.6`
2. **Major.minor prefix (question mark)**
   - Input: `10.?`
   - Lookup: `branch__startswith` with `?` stripped
   - Example: `10.?` → matches branches starting with `10.`
3. **Exact numeric branch**
   - Input: `10.6`
   - Lookup: `branch__exact`
4. **Substring match (surrounded by `*`)**
   - Input: `*10.6*`
   - Lookup: `branch__icontains` with `*` stripped
5. **Substring match with `?` (surrounded by `*`)**
   - Input: `*10.?*`
   - Lookup: `branch__icontains` with `*` and `?` stripped
   - Example: `*10.?*` → searches for substring `10.`

6. **Default (free text, no wildcards)**
   - Input: `feature_x`, `10.6.1`, `release-2026`
   - Lookup: `branch__icontains`

Notes:
- Allowed characters: letters, digits, `_ . - * ?` (and `=` only for the special exact syntax).
- If the value contains other characters (e.g., spaces), it may fail to match any supported pattern and will be skipped.

---

### Revision (`filters.revision`)
Backed by `test_run_id__revision`.

- Input: `abc123`
- Lookup: `revision__startswith`
- Allowed characters: letters and digits only (`[a-zA-Z0-9]`)

---

### Platform (`filters.platform`)
Backed by `test_run_id__platform`.

1. **Exact match**
   - Input: `amd64-centos-7-bintar`
   - Lookup: `platform__exact`
2. **Substring match**
   - Input: `*bintar*`
   - Lookup: `platform__icontains` with `*` stripped

---

### From Date (`filters.dt`)
Backed by `test_run_id__dt`.

- Input formats accepted:
  - `YYYY-MM-DD` (e.g., `2026-01-01`)
  - `YYYY-MM-DD HH:MM:SS` (e.g., `2026-01-01 12:30:00`)
- Lookup: `dt__gte` (inclusive)

If parsing fails, the date filter is not applied.

---

### Type (`filters.typ`)
Backed by `test_run_id__typ`.

1. **Exact**
   - Input: `nm`
   - Lookup: `typ__exact`
2. **Prefix**
   - Input: `rocks*`
   - Lookup: `typ__startswith` with `*` stripped


---

### Test Name (`filters.test_name`)
Backed by `test_failure.test_name`.

1. **Exact**
   - Input: `spider.auto_increment`
   - Lookup: `test_name__exact`
2. **Substring (special `*.` prefix)**
   - Input: `*.sp-error`
   - Lookup: `test_name__icontains` with `*` stripped (the leading `.` remains)
   - Example: `*.sp-error` → searches for substring `.sp-error` inside `test_name`

Allowed characters: `/ a-z A-Z 0-9 _ . -`

---

### Failure Output (`filters.failure_text`)
Backed by `test_failure.failure_text`.

1. **Default substring search**
   - Input: `Unknown error -11`
   - Lookup: `failure_text__icontains`

2. **Substring wrapped in `*` (alnum only)**
   - Input: `*timeout*`
   - Lookup: `failure_text__icontains` with `*` stripped

Notes:
- The “no-asterisks” form is the most flexible (can include spaces/symbols).
- The `*...*` form only matches alphanumeric content per the regex.

---

### Limit (`filters.limit`)
- Default: `50`
- Input: numeric string (e.g., `100`)
- Applied as slice after ordering: newest first (`order_by('-test_run_id__dt')[:limit]`)
