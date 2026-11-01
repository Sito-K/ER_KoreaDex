# Elite Redux 한국어 도감 — v1

**사이트:** https://sito-k.github.io/ER_KoreaDex/

## v1 기준 (2026-11-01)

- 게임: **Elite Redux Korean v1**, `Sito-K/EliteReduxKorean`의 `korean` 브랜치, STAGE180 (`8e2ce51d1d904bce41ea87ebe78c15140eed7a63`)
- 번역 마스터: **STAGE172**, 34,120개 소스 레코드
- 도감 엑셀: `Elite_Redux_Korean_Dex_V0.1_STAGE172_TRANSLATION_SYNC_20261101.xlsx`
- 도감 규모: 포켓몬·폼 1,922개, 기술 1,031개, 특성 1,062개
- STAGE172 번역 수정 **680건** (포켓몬 이름 11, 기술 192, 특성 436, 장소 17, 진화아이템 24) 동기화
- 목록, 기술·특성 요약/상세, 포켓몬 진화/습득기술 연계 표시, 장소/아이템 명칭 모두 같은 번역 레이어를 이용

정적 사이트에서 `v1-translation-sync.js`를 로드해 **한국어 표시 문자열만** 최신화합니다. 기존 ID, 종족값, 전투 기술/특성 수치, 폼, 진화 관계, 레벨업 및 출현 데이터는 변경하지 않습니다. 느리게 불러오는 세부 정보도 초기 로드된 번역을 적용합니다.

이전 클린 리빌드 백업: `backup-pre-clean-rebuild-20261009`.
