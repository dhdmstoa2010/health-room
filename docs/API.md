# 보건실 관리 시스템 API 명세서 (v0.1 초안)

프론트엔드 `apps/user`(학생 접수 키오스크)와 `apps/admin`(보건교사 어드민)이 현재 사용하는 데이터와 화면 동작을 기준으로 정리했습니다.
지금은 어드민이 `localStorage`, 키오스크가 목업 함수(`apps/user/src/lib/api.ts`)를 쓰고 있어서, 아래 API가 붙으면 그대로 교체됩니다.

> 표시 규칙: **[확정]** = 프론트 코드에 이미 있는 동작 / **[제안]** = 프론트에 없어서 백엔드와 합의가 필요한 부분

---

## 0. 공통 규약

| 항목 | 내용 |
|---|---|
| Base URL | `/api/v1` |
| 형식 | JSON (`Content-Type: application/json`), 필드명 camelCase |
| 날짜 / 시간 | 날짜 `YYYY-MM-DD`, 시간 `HH:mm` (24시간). 서버 기준 시간대 `Asia/Seoul` |
| ID | 문자열. 서버가 생성 (프론트는 신규 등록 시 id를 보내지 않음) |
| 인증 | **[제안]** 어드민: 로그인 후 토큰 (프론트에 로그인 화면 아직 없음, 권한 `ADMIN`) / 키오스크: 고정 키오스크 토큰. 합의 필요 |
| 삭제 | 응답 `204 No Content` |

### 어드민 로그인 (비밀번호 전용) **[확정]**

`POST /auth/login` — 아이디 없이 비밀번호만 받습니다. 어드민 화면은 로그인 전에는 로그인 페이지만 보여줍니다.

```json
// 요청
{ "password": "****" }
// 200
{ "token": "..." }
// 401 비밀번호 불일치 → 화면: "비밀번호가 올바르지 않습니다."
```
- 이후 모든 어드민 API는 `Authorization: Bearer {token}` 헤더로 호출합니다. 프론트는 토큰을 `sessionStorage`에 보관하므로 탭을 닫으면 로그아웃됩니다.
- 어드민 API가 `401`을 반환하면 프론트가 토큰을 지우고 로그인 화면으로 돌려보냅니다 (토큰 만료 포함).
- 비밀번호 무차별 대입 방지를 위해 서버에서 실패 횟수 제한(예: 5회 실패 시 잠금, `429`)을 권장합니다.
- 프론트 환경변수: `VITE_API_URL`(예: `https://host/api/v1`). 미설정 시 개발 모드(`npm run dev`)에서만 목업 로그인(`VITE_ADMIN_PASSWORD`, 기본값 `admin1234`)이 동작하고, 운영 빌드에서는 로그인이 막힙니다.
- 키오스크 인증은 별도 합의 항목입니다(9장).

### 에러 응답

```json
{ "code": "VALIDATION_ERROR", "message": "학년과 반은 1 이상의 숫자여야 합니다.", "fields": { "grade": "must be >= 1" } }
```

| HTTP | code | 사용처 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 필수값 누락, 범위 오류 |
| 401 / 403 | `UNAUTHORIZED` / `FORBIDDEN` | 인증/권한 |
| 404 | `NOT_FOUND` | 대상 없음 (예: 없는 학생) |
| 409 | `DUPLICATE` / `IN_USE` | 중복 등록 / 사용 중인 코드 삭제 |

### 목록 조회 공통

- 기간 조회는 `from`, `to` (양 끝 포함, `YYYY-MM-DD`).
- 현재 프론트는 전체를 받아 클라이언트에서 필터·정렬합니다. 데이터가 많아질 것을 대비해 `page`(0부터), `size`(기본 50, 최대 1000)를 **[제안]**하되, 일괄출력·통계처럼 전체가 필요한 곳은 `size=1000` 이상 혹은 전용 집계 API를 씁니다. 페이징 응답은 `{ "items": [...], "total": 123, "page": 0, "size": 50 }`, 그 외 단순 목록은 `{ "items": [...] }`로 통일합니다.

---

## 1. 데이터 모델

```ts
Code        { id, group: 'symptom' | 'medicine', name, active: boolean, treatments?: string[] }
            // treatments: group=symptom일 때 키오스크에 보여줄 추천 처치 [제안]
ClassInfo   { id, grade: number, classNo: number, teacher: string, studentCount?: number }
            // studentCount: 키오스크 번호 버튼 개수(현재 하드코딩 16) [제안]
Student     { id, grade, classNo, number, name }
MedUse      { medicineId, qty }
HealthLog   { id, date, time, grade, classNo, number?: number, studentName,
              symptomId, treatment, medicines: MedUse[], note, source?: 'KIOSK' | 'ADMIN' }
HospitalCare{ id, date, grade, classNo, studentName, hospital,
              transport: '119' | '보호자' | '교직원 동행' | '기타', reason, action }
Chronic     { id, grade, classNo, studentName, symptom, disease, note, registeredAt }
Purchase    { id, date, medicineId, qty, note }
Schedule    { id, date, time, category: '행사' | '검진' | '교육' | '기타', title, content }
Settings    { dailyRows, approvalLine: string[], statsResetMonth, retentionYears }
```

초기 데이터(시드) 기본값: 학년 1~3 × 반 1~4 학급, 증상 코드(두통, 복통, 감기, 외상, 찰과상, 생리통, 어지러움), 약품 코드(타이레놀, 소화제, 밴드, 소독약, 파스), 설정은 아래 `5.2`의 기본값.

---

## 2. 키오스크 API (`apps/user`)

접수 흐름: 학년 → 반 → 번호 선택(이름 조회) → 증상 선택 → 처치 선택 → 확인 모달 → 접수 → 완료 화면(10초 후 자동 초기화).

### 2.1 학급 목록
`GET /classes` — 학년/반 버튼 구성용 (현재 학년 1~3, 반 1~4 하드코딩). 응답은 5.1과 동일.
- **[제안]** 번호 버튼 개수(현재 `MAX_NUMBER = 16` 하드코딩)를 `studentCount`로 내려주기.

### 2.2 학생 이름 조회 **[확정]**
`GET /students?grade=1&classNo=2&number=5`

번호를 누르는 즉시 호출되며, 성공하면 바로 증상 선택 화면으로 넘어갑니다.

```json
// 200
{ "id": "1-2-5", "grade": 1, "classNo": 2, "number": 5, "name": "김하늘" }
// 404 - 해당 번호의 학생이 없음 → 화면: "해당 번호의 학생을 찾을 수 없어요. 다시 선택해 주세요."
```
그 외 실패(5xx, 네트워크)는 "학생 정보를 불러오지 못했어요" 문구로 표시됩니다.

### 2.3 증상 목록 + 추천 처치
`GET /codes?group=symptom&active=true`

현재 증상 7종과 증상별 추천 처치(`TREATMENTS`)가 프론트에 하드코딩되어 있고 `TODO: 서버 코드 API 연동` 주석이 있습니다. 어드민 공통코드와 같은 소스를 쓰기 위해 **[제안]** 증상 코드에 `treatments` 배열을 포함해 주세요.

```json
{ "items": [
  { "id": "sym-두통", "group": "symptom", "name": "두통", "active": true, "treatments": ["휴식", "약 복용", "냉찜질"] }
] }
```
키오스크는 목록 끝에 "기타(직접 입력)" 선택지를 프론트에서 붙이고, 처치에도 직접 입력이 가능합니다.

### 2.4 접수 (방문 등록) **[확정 + 보완 제안]**
`POST /visits`

```json
// 현재 프론트가 보내는 형태
{ "grade": 1, "classNo": 2, "number": 5, "symptom": "두통", "treatment": "약 복용" }
```
- **이름은 보내지 않습니다.** 서버가 학년/반/번호로 학생을 찾아 이름을 매핑합니다.
- 서버가 현재 일시(`date`, `time`)를 채워 **보건일지(HealthLog)를 생성**합니다 (`source=KIOSK`, `medicines=[]`, `note=""`). 어드민 보건일지 화면에 바로 나타납니다.
- 학생이 없으면 `404`.
- **[제안·합의 필요] 증상 값**: 어드민은 증상을 코드 `symptomId`로 관리하고 통계도 코드 기준인데, 키오스크는 이름 문자열이며 "기타"는 자유 입력입니다. 아래 둘 중 하나로 정해 주세요. (제 추천: A)
  - **A.** 요청을 `{ symptomId?, symptomText? }`로 바꿉니다. 목록에서 고르면 `symptomId`, 직접 입력이면 `symptomText`. 서버는 `symptomText`가 기존 활성 증상 이름과 같으면 그 코드로 매핑하고, 아니면 "기타" 코드로 저장하되 원문을 `note`에 보관.
  - **B.** 지금처럼 `symptom`(이름)만 받고 서버가 이름으로 코드를 매핑. 매핑 실패 시 처리 규칙 필요.

```json
// 201
{ "id": "...", "date": "2026-11-05", "time": "09:20", "grade": 1, "classNo": 2, "number": 5,
  "studentName": "김하늘", "symptomId": "sym-두통", "treatment": "약 복용", "medicines": [], "note": "", "source": "KIOSK" }
```
완료 화면은 증상·처치만 보여주므로 응답 본문은 최소한이어도 됩니다.

---

## 3. 보건일지 (어드민 `logs`, `logs-print`)

### 3.1 목록 조회
`GET /health-logs?from=&to=&keyword=&sort=desc&page=&size=`

| 파라미터 | 설명 |
|---|---|
| `from`, `to` | 기간. 화면 기본값: `from` = 이번 달 1일, `to` = 오늘 |
| `keyword` | `studentName` 또는 `treatment`에 **부분 일치** |
| `sort` | `desc`(기본: 일자, 시간 내림차순 — 보건일지 화면) / `asc`(일자, 시간 오름차순 — 일괄출력) |

응답: `{ items: HealthLog[], total }` — 화면에 "총 N건" 표시. 일괄출력은 기간 내 전체를 한 번에 받습니다.

### 3.2 등록 / 수정 / 삭제
- `POST /health-logs` → `201 HealthLog`
- `GET /health-logs/{id}`
- `PUT /health-logs/{id}` → `200 HealthLog`
- `DELETE /health-logs/{id}` → `204`

요청 본문 (등록·수정 동일):
```json
{ "date": "2026-11-05", "time": "09:20", "grade": 1, "classNo": 2, "studentName": "김하늘",
  "symptomId": "sym-두통", "treatment": "휴식 후 약 복용",
  "medicines": [{ "medicineId": "med-타이레놀", "qty": 1 }], "note": "" }
```
검증 [확정]:
- `grade`(1 이상), `studentName`(공백 제거 후 비어있지 않음), `symptomId` **필수**.
- `treatment`, `note`는 빈 문자열 허용. `date` 기본값 오늘, `time` 기본값 현재 시각.
- `medicines`: `medicineId` 없거나 `qty <= 0`인 행은 **서버에서 버리거나 400**(프론트는 저장 전에 걸러서 보냄). `medicineId`는 `group=medicine` 코드여야 함. 비활성 코드는 신규 선택 불가(기존 기록의 참조는 유지).
- 약품 출고량은 약품 재고(4.2)에 반영됩니다. 재고가 음수가 되어도 저장은 허용합니다(수불부에서 음수를 빨간색으로 표시).

### 3.3 일자 변경
`PATCH /health-logs/{id}/date` — `{ "date": "2026-11-04" }` → `200 HealthLog`
(프론트는 현재 전체 PUT으로 처리하지만, 별도 "일자변경" 기능이라 전용 엔드포인트를 권장합니다. 전체 PUT 사용도 무방.)

### 3.4 기간 요약 통계
`GET /health-logs/summary?from=&to=&keyword=` — 보건일지 화면 우측 "증상분류 통계"와 "약품 사용(출고)" 패널. 조회 조건은 목록과 동일하게 적용.
```json
{ "symptoms": [{ "symptomId": "sym-두통", "name": "두통", "count": 5 }],
  "medicines": [{ "medicineId": "med-타이레놀", "name": "타이레놀", "qty": 7 }] }
```
둘 다 건수/수량 내림차순. 삭제된 코드 등으로 이름을 못 찾으면 증상은 `미분류`.

---

## 4. 학생 관리 / 약품 관리

### 4.1 병원치료 (`hospital`) — 기본 CRUD
`GET /hospital-cares` (일자 내림차순) · `POST` · `PUT /{id}` · `DELETE /{id}`

```json
{ "date": "2026-11-05", "grade": 2, "classNo": 1, "studentName": "이준호", "hospital": "OO병원",
  "transport": "119", "reason": "골절 의심", "action": "보호자 연락 후 이송" }
```
필수: `grade`, `studentName`, `hospital`. `transport`는 `119 | 보호자 | 교직원 동행 | 기타` (기본 `119`). `date` 기본 오늘. `reason`, `action`은 선택.

### 4.2 요양호자 (`chronic`) — 기본 CRUD
`GET /chronic-students` (학년, 반 오름차순) · `POST` · `PUT /{id}` · `DELETE /{id}`

```json
{ "grade": 1, "classNo": 3, "studentName": "오지우", "disease": "천식", "symptom": "호흡곤란", "note": "흡입기 소지" }
```
필수: `grade`, `studentName`, `disease`. `symptom`, `note` 선택. `registeredAt`은 서버가 등록일(오늘)로 채움. 대시보드의 "요양호자" 숫자는 이 목록의 총 인원.

### 4.3 약품 구입 (`purchases`) — 기본 CRUD
`GET /medicine-purchases` (일자 내림차순) · `POST` · `PUT /{id}` · `DELETE /{id}`

```json
{ "date": "2026-11-05", "medicineId": "med-타이레놀", "qty": 20, "note": "추가 구입" }
```
필수: `medicineId`(약품 코드), `qty >= 1`. `date` 기본 오늘. 구입 화면의 약품 선택에는 **활성** 약품만 노출.

### 4.4 현재 재고
`GET /medicines/stock`

```json
{ "items": [{ "medicineId": "med-타이레놀", "name": "타이레놀", "active": true, "stock": 42 }] }
```
`stock` = 누적 구입량 − 누적 보건일지 사용량(전 기간). 수불부 우측 "현재 재고"는 **비활성 포함 전체 약품**, 대시보드 "재고 부족"은 활성 약품 중 `stock <= 5`만 사용하므로 `active` 포함해서 내려주세요.

### 4.5 약품수불부
`GET /medicines/{medicineId}/ledger?from=&to=` (화면 기본: `from` = 올해 1월 1일, `to` = 오늘)

```json
{ "opening": 30,
  "entries": [
    { "date": "2026-03-02", "kind": "입고", "qty": 20, "note": "추가 구입", "balance": 50 },
    { "date": "2026-03-02", "kind": "출고", "qty": 1,  "note": "김하늘 처치", "balance": 49 }
  ],
  "totalIn": 20, "totalOut": 1, "closing": 49 }
```
- `kind`: `입고`(구입, note = 구입 비고 없으면 `구입`) / `출고`(보건일지 사용, note = `{학생이름} 처치`).
- 정렬: 일자 오름차순, 같은 날은 **입고 먼저**.
- `opening`(이월 재고) = `from` 이전의 (입고 − 출고) 누계. `balance`는 이월 재고에서 시작하는 누적 잔량. `closing = opening + totalIn − totalOut`.

---

## 5. 공통 관리

### 5.1 학년반 (`classes`)
- `GET /classes` (학년, 반 오름차순)
- `POST /classes` — `{ "grade": 1, "classNo": 1, "teacher": "" }`
- `PUT /classes/{id}`, `DELETE /classes/{id}`
- 검증 [확정]: `grade`, `classNo`는 1 이상 정수 / `(grade, classNo)` **중복 불가 → 409 `DUPLICATE`** ("이미 등록된 학년반입니다.") / `teacher` 선택.
- 삭제 시 기존 보건일지는 학년·반 값을 그대로 보관합니다(일지는 학급 FK가 아니라 값 복사).

**일괄 등록** `POST /classes/bulk` — 현재 프론트가 엑셀(.xlsx)을 브라우저에서 파싱하므로 JSON으로 받는 것을 가정합니다.
```json
{ "items": [{ "grade": 1, "classNo": 1, "teacher": "홍길동" }] }
// 200
{ "created": 10, "updated": 2 }
```
- 엑셀 양식: 1행 제목 / A열 학년 · B열 반 · C열 담임(선택). 학년·반이 1 미만이거나 숫자가 아닌 행은 건너뜀.
- **upsert**: 이미 있는 `(grade, classNo)`는 담임만 갱신하며, 새 담임이 **비어 있으면 기존 담임 유지**.
- (대안) 서버가 파일을 직접 받으려면 `multipart/form-data`로 `POST /classes/import`.

### 5.2 공통코드 (`codes`) — 증상분류 / 처치약품
- `GET /codes?group=symptom|medicine&active=true|false` (생략 시 전체)
- `POST /codes` — `{ "group": "symptom", "name": "두통" }` → `active` 기본 `true`
- `PUT /codes/{id}` — 이름 수정 (+ 증상이면 `treatments`)
- `PATCH /codes/{id}/active` — `{ "active": false }` 사용/사용안함 토글
- `DELETE /codes/{id}`

규칙 [확정]:
- `name` 공백 제거 후 필수. **같은 `group` 안에서 이름 중복 불가 → 409 `DUPLICATE`** ("같은 이름의 코드가 있습니다.").
- 보건일지(`symptomId`, `medicines.medicineId`) 또는 약품 구입(`medicineId`)에서 사용 중인 코드는 **삭제 불가 → 409 `IN_USE`** ("사용 중인 코드는 삭제할 수 없습니다. 대신 사용안함으로 변경하세요."). 이 경우 비활성(`active=false`)으로만 처리.
- 비활성 코드: 신규 입력 화면의 선택지에서는 빠지지만, 기존 기록·통계·수불부·재고에서는 계속 표시.

### 5.3 환경설정 (`settings`)
- `GET /settings`
- `PUT /settings`

```json
{ "dailyRows": 20, "approvalLine": ["담당", "교감", "교장"], "statsResetMonth": 3, "retentionYears": 5 }
```

| 필드 | 의미 | 검증 / 기본값 |
|---|---|---|
| `dailyRows` | 일괄출력 1장당 행 수 | 1~100 / 20 |
| `approvalLine` | 출력물 결재란 | 1개 이상, 빈 문자열 제외 / `["담당","교감","교장"]` |
| `statsResetMonth` | 통계(학년도) 시작 월 | 1~12 / 3 |
| `retentionYears` | 데이터 보관기간(년) | 1~30 / 5 |

### 5.4 보관기간 경과 데이터 삭제
`POST /health-logs/purge-expired?dryRun=true|false`

기준일 = (오늘 − `retentionYears`년), **`date < 기준일`** 인 보건일지가 대상.
프론트는 삭제 전 확인창에 건수를 보여주므로, `dryRun=true`로 건수만 먼저 받고 확인 후 `dryRun=false`로 실제 삭제합니다 [제안].
```json
{ "cutoffDate": "2021-11-05", "count": 12, "deleted": false }
```
영구 삭제 작업이므로 ADMIN 권한 필수.

### 5.5 프로그램 정보 (선택)
`GET /app-info` → `{ "name": "보건일지관리시스템 (어드민)", "version": "0.1.0", "vendor": "health-room", "role": "ADMIN" }` (현재 프론트 상수. 서버 연동은 선택)

---

## 6. 통계 / 대시보드

### 6.1 학년반 통계 (`stats-class`)
`GET /stats/by-class?year=2026&mode=class|grade`

`year` = 학년도 시작 연도(생략 시 오늘이 속한 학년도). 학년도는 `statsResetMonth`월부터 12개월입니다 (예: 3월 시작이면 `2026` → 2026-03 ~ 2027-02. 오늘이 `statsResetMonth` 이전 달이면 직전 연도가 현재 학년도).

```json
{ "year": 2026,
  "months": [{ "key": "2026-03", "label": "3월" }, "..."],
  "rows": [{ "key": "1-1", "label": "1학년 1반", "cells": [0,2,1,0,0,0,0,0,0,0,0,0], "total": 3 }],
  "totals": [0,2,1,0,0,0,0,0,0,0,0,0], "grand": 3 }
```
- `mode=class`: 등록된 모든 학급을 행으로(방문 0건도 포함), `mode=grade`: 등록된 학급에 있는 학년별 집계.
- 건수는 보건일지 1건 = 1회. `cells`는 `months` 순서와 동일. 등록되지 않은 학급의 일지는 행에 나오지 않습니다.
- 화면 연도 선택은 현재 학년도 포함 최근 5개 학년도. 프론트가 계산하므로 서버는 임의의 `year`만 처리하면 됩니다.

### 6.2 증상분류 통계 (`stats-symptom`)
`GET /stats/by-symptom?year=2026` — 응답 구조는 위와 동일. 행은 **증상 코드 전체**(비활성 포함, 0건 포함), `key`는 `symptomId`, `label`은 코드명.

### 6.3 대시보드
`GET /dashboard?days=14` (`days`: 7 | 14 | 30, 기본 14)

```json
{ "date": "2026-11-05",
  "todayCount": 3, "yesterdayCount": 2,
  "monthCount": 27,
  "chronicCount": 4,
  "daily": [{ "date": "2026-10-23", "count": 1 }],
  "symptomTop5": [{ "symptomId": "sym-두통", "name": "두통", "count": 8 }],
  "gradeCounts": [{ "grade": 1, "count": 9 }],
  "lowStock": [{ "medicineId": "med-밴드", "name": "밴드", "stock": 3 }],
  "upcomingSchedules": [{ "id": "...", "date": "2026-11-08", "time": "10:00", "category": "검진", "title": "학생 건강검진", "content": "" }] }
```
- `daily`: 오늘 포함 최근 `days`일을 **빈 날짜도 0으로 채워** 날짜 오름차순. 프론트가 합계·일평균·최다 방문일을 여기서 계산합니다.
- `symptomTop5`, `gradeCounts`: **이번 달**(1일~오늘) 보건일지 기준. 증상 상위 5개 내림차순, 학년은 오름차순.
- `lowStock`: 활성 약품 중 재고 ≤ 5.
- `upcomingSchedules`: 오늘 이후(오늘 포함) 일정, 날짜 오름차순 5건.
- 개별 API 조합으로도 구현 가능하지만 화면 1회 로딩을 위해 집계 API를 요청합니다.

---

## 7. 일정 (`schedule`)

- `GET /schedules?from=&to=` — 날짜·시간 오름차순. 달력은 해당 월 1일~말일, 우측 "기간별 조회"는 사용자가 고른 기간을 같은 API로 조회.
- `POST /schedules` → `201` · `PUT /schedules/{id}` · `DELETE /schedules/{id}`

```json
{ "date": "2026-11-08", "time": "10:00", "category": "검진", "title": "학생 건강검진", "content": "전 학년 대상" }
```
필수: `title`(공백 제거 후), `date`. `time` 기본 `09:00`. `category`는 `행사 | 검진 | 교육 | 기타`(기본 `행사`). `content` 선택.

---

## 8. 엔드포인트 요약

| 영역 | 메서드 / 경로 | 사용 화면 |
|---|---|---|
| 학급 | `GET/POST /classes`, `PUT/DELETE /classes/{id}`, `POST /classes/bulk` | 학년반등록, 키오스크, 통계 |
| 학생 | `GET /students?grade&classNo&number` | 키오스크 |
| 접수 | `POST /visits` | 키오스크 |
| 보건일지 | `GET/POST /health-logs`, `GET/PUT/DELETE /health-logs/{id}`, `PATCH /health-logs/{id}/date`, `GET /health-logs/summary`, `POST /health-logs/purge-expired` | 보건일지, 일괄출력, 환경설정 |
| 병원치료 | `GET/POST /hospital-cares`, `PUT/DELETE /hospital-cares/{id}` | 병원치료등록 |
| 요양호자 | `GET/POST /chronic-students`, `PUT/DELETE /chronic-students/{id}` | 요양호자등록 |
| 약품 | `GET/POST /medicine-purchases`, `PUT/DELETE /medicine-purchases/{id}`, `GET /medicines/stock`, `GET /medicines/{id}/ledger` | 약품구입등록, 약품수불부 |
| 코드 | `GET/POST /codes`, `PUT/DELETE /codes/{id}`, `PATCH /codes/{id}/active` | 공통코드등록, 키오스크, 각종 선택 |
| 설정 | `GET/PUT /settings`, `GET /app-info` | 환경설정, 프로그램정보 |
| 통계 | `GET /stats/by-class`, `GET /stats/by-symptom`, `GET /dashboard` | 통계, 대시보드 |
| 일정 | `GET/POST /schedules`, `PUT/DELETE /schedules/{id}` | 일정등록/조회, 대시보드 |

---

## 9. 백엔드와 합의가 필요한 항목

1. **인증/권한**: 어드민 로그인 방식, 키오스크 인증 방식 (현재 프론트에 로그인 없음).
2. **학생 명단**: 키오스크가 `GET /students`로 이름을 조회하는데, 어드민에 학생 명단을 등록·업로드하는 화면이 없습니다. 명단은 어떻게 채울지(엑셀 일괄 등록 API 추가 / 외부 NEIS 연동 등) 정해야 합니다. 어드민 일지는 이름을 직접 입력받아 `studentId`로 연결되어 있지 않습니다.
3. **키오스크 증상 값**: 2.4의 A/B 안 중 선택 (코드 ID vs 이름 문자열, "기타" 자유입력 처리).
4. **증상별 추천 처치**를 코드에 저장할지(제안: `treatments` 배열), 별도 테이블로 둘지.
5. **번호 버튼 개수**(현재 16 고정)를 `ClassInfo.studentCount`로 내려줄지, 명단 기준으로 계산할지.
6. 목록 API의 **페이징 도입 시점** — 지금 프론트는 전체 조회 후 클라이언트 필터링이므로, 처음에는 `from`/`to` 필터만으로도 동작합니다.
7. 보건일지 `source`(KIOSK/ADMIN)와 `number` 컬럼을 저장할지.
