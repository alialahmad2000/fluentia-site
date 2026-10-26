# NEEDS-ALI — facts only Ali can confirm

Nothing below is published anywhere. Each answer goes into `FACTS.md` FIRST, then
into the page(s) named — one edit in `content/guide/<page>.md`, and the build
regenerates the HTML, the `.md` mirror, `llms.txt`, `llms-full.txt` and JSON-LD.

These are the questions leads ask most often that the site does not answer today —
AI assistants cannot quote what is not published.

## A. Classes and schedule
1. **Class length** in minutes (group class / 1:1 class / intensive practice session)? → faq, pricing, private-training, about, en/about
2. **Group times:** which days and hours do أساس / تميّز groups run (evenings? weekends? several slots to choose from)? Can a learner move to another group later? → faq, group-vs-private, how-it-works
3. **1:1 times (2,000 plan):** freely agreed with the learner like the intensive («المواعيد نتفق عليها معك»)? → english-for-work, how-to-choose, faq
4. **Missed class** (absence, not lateness): make-up class, or the recording only? → faq
5. **Mixed or separate** groups for women and men? Can a learner request a female/male trainer? → faq, group-vs-private
6. **Camera** required on Google Meet, or audio-only accepted? → faq (الأمور التقنية)
7. **Language of explanation** for beginners: Arabic support at low levels, English-only higher up? → faq, about, english-from-zero
8. Is a **Pre-A1 group** open every month, or does a true beginner sometimes wait / go 1:1? Does Pre-A1 start from the alphabet? → english-from-zero
9. **Follow-up channel:** daily follow-up via Telegram for every package that has it (تميّز, 1:1, intensive)? /start says «يومياً عبر تيليجرام» for all, but أساس is listed as **monthly** follow-up — which is right for أساس? → faq, speaking-fluency, private-training
10. Is **«تسجيل الحصة»** (class recording in each unit) in every package with live classes? → faq, speaking-fluency, english-for-work
11. Who teaches the **group classes** — may we write «مدربون سعوديون» (homepage meta and /start say it; /private says the mentor is usually a native speaker)? Any trainer credentials we can publish? → about, faq, is-fluentia-legit

## B. Packages and payment
12. **Payment methods** (mada, Apple Pay, card, bank transfer, STC Pay, instalments)? → pricing, faq, how-it-works
13. **التدريب الفردي (from 2,000):** how many weekly classes does 2,000 buy, what does each extra weekly class add, and can it go above 3,000? → pricing, private-training, faq
14. Does the **2,000 plan include the full platform**? (stated for every other package, not for this one) → pricing, private-training, faq
15. **Joining mid-month:** is the first month prorated, and what exactly does «المدرب يعوّضك» mean? → pricing, how-it-works, english-from-zero
16. **Self-study (500):** bought directly with instant access, or also through an initial meeting? Where is it bought? Is its «مساعد AI للمحادثة والنطق» still live now that «المحادثة مع ليلى» is hidden? → pricing, how-it-works
17. Is the intensive's **extended diagnostic session** inside the 12 classes or extra? Is the /private «استشارة» the same as the free لقاء مبدئي? → private-training
18. Any **discounts** (siblings, two together, several months prepaid)? Can a subscription be **paused** (travel, Ramadan, exams)? → faq
19. Can تميّز's 4 private classes be used for **interview / presentation prep**? Do group classes include any work-English content? → english-for-work

## C. Trust and identity
20. **Founding date:** /about says «تأسست 23 مارس 2026»; the old schema and hero said 2021. Which is correct? (Removed from the schema until answered.) → about, is-fluentia-legit, Organization JSON-LD
21. **Commercial registration / licence** number or legal name (e.g. «معهد الطلاقة والمعرفة») that may be published? → is-fluentia-legit, Organization `legalName`
22. **Accreditation:** /start says «معتمدون رسمياً». By whom (e.g. TVTC)? If none, that line should come off /start. → is-fluentia-legit, faq («هل أكاديمية طلاقة معهد معتمد؟»)
23. **Certificate** at the end of a level/package? What does it state? → faq, about
24. **Which email** do customers use — hi@fluentia.academy or fluentia.sa@gmail.com? → about, is-fluentia-legit, en/about, schema
25. Is **X/Twitter @fluentia_** a real, active account (it is in the page meta, not linked)? Any Snapchat / YouTube / LinkedIn profiles? → schema `sameAs`, about
26. **Ratings and counts** on /about («4.9★»، «+14 طالب نشط»، «+100 شهادة نجاح») and /start («⭐ 4.9 · +50 طالب»): source? If none, they should come off those pages (same risk as the fake AggregateRating removed 2026-06-24).
27. **Learners under 18:** the terms allow 13+ with a guardian; the site says «للكبار». Are teens accepted? Children? → faq, about
28. **Outside Saudi Arabia** (Gulf, abroad): can they join? → faq, online-english-saudi-arabia, schema `areaServed`

## D. Programmes
29. **IELTS:** full mock tests marked to a band? Target band + timeline set in the first meeting? Materials? Academic and General Training both? Group or 1:1 only? What is the «مختبر IELTS» badge on the homepage platform band? Confirm there is no separate IELTS package/price. → ielts
30. **STEP** preparation track? (there is a STEP article, no track) → faq
31. **Companies:** is there a corporate offer for teams? (The forms have an optional «الشركة» field; no corporate page exists, so `/guide/corporate-english` was NOT written.) → new page corporate-english
32. **Apps:** iPhone/iPad/Android apps available to students today, or Mac + web only? (Terms §12 mentions Mac, iPhone and iPad.) → faq, about, en/about
33. **Free trial lesson** at app.fluentia.academy/try: what does it contain, how long, account needed? → faq, how-to-choose, english-from-zero
34. Typical **reply time** for 1:1 «أولوية في الرد»? → how-to-choose
35. **Hours per Fluentia level:** roughly how many guided hours (or months at a given package) does one level take? 72 units ÷ 6 levels = 12 units each — correct? → cefr-levels, how-long-to-learn-english
