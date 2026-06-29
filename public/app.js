const app = document.querySelector("#app");
const state = {
  data: null,
  user: JSON.parse(localStorage.getItem("wc-user") || "null"),
  token: localStorage.getItem("wc-token") || "",
  authMode: "login",
  authNotice: "",
  resetUsername: "",
  tab: "matches",
  adminTab: "scores",
  day: "all",
  dayManuallySelected: false,
  autoScrollToToday: true,
  chartPlayerId: "",
  showPointsChart: false,
  funFactsLoading: false,
  accountSaved: false,
  timezone: localStorage.getItem("wc-timezone") || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  lang: localStorage.getItem("wc-lang") || "en"
};

const translations = {
  en: {
    appTitle: "World Cup 2026 Predictions",
    loginTitle: "World Cup prediction contest",
    loginIntro: "Sign in with your player account. Admin credentials open the admin area.",
    privateContestNotice: "Private prediction contest for friends. This site is not affiliated with FIFA, the FIFA World Cup, or any official tournament organizer.",
    signupIntro: "Create your player account once, then sign in each day to update predictions.",
    signupPending: "Your account was created and is waiting for admin approval. You can sign in after it is approved.",
    language: "Language",
    english: "English",
    farsi: "Farsi",
    login: "Log in",
    signup: "Sign up",
    username: "Username",
    email: "Email address",
    screenName: "Screen name",
    password: "Password",
    forgotPassword: "Forgot password?",
    forgotPasswordIntro: "Enter your username and we will email a reset code to the address saved on your account.",
    resetPassword: "Reset password",
    resetPasswordIntro: "Enter the code from your email and choose a new password.",
    resetCode: "Reset code",
    sendResetCode: "Send reset code",
    resetCodeSent: "If that account has an email address, a reset code has been sent.",
    passwordResetDone: "Password reset. You can sign in with your new password.",
    backToLogin: "Back to login",
    createAccount: "Create account",
    matches: "matches",
    players: "players",
    administrator: "Administrator",
    playerAccount: "Player account",
    signOut: "Sign out",
    account: "Account",
    accountSettings: "Account Settings",
    accountNotice: "Add an email address for password resets, and change the name shown in the ranking table. To change your password, enter your current password and a new password.",
    currentPassword: "Current password",
    confirmNewPassword: "Confirm new password",
    updateAccount: "Update account",
    accountUpdated: "Account updated.",
    passwordMismatch: "New passwords do not match.",
    favoriteTeam: "Favorite team",
    avatar: "Profile picture",
    avatarNotice: "Upload a photo, or leave it blank to use your favorite team's flag.",
    uploadPhoto: "Upload photo",
    useTeamAvatar: "Use team avatar",
    photoTooLarge: "Please choose a smaller image.",
    predictions: "Predictions",
    scoringRules: "Scoring Rules",
    funFacts: "Fun Facts",
    matchReports: "Match Reports",
    noMatchReports: "No pre-match reports have been generated yet.",
    preMatchReport: "Pre-match report",
    predictionDistribution: "Prediction distribution",
    mostFrequentScores: "Most frequent scores",
    frequentPredictionSentence: "{count} players predicted this match {score} in favor of {team}.",
    frequentDrawSentence: "{count} players predicted this match to end {score}.",
    allPredictions: "All predictions",
    participantsPredicted: "{count} of {total} participants predicted this match.",
    percentOfPlayers: "% of players",
    percentOfPredictions: "% of predictions",
    draw: "Draw",
    noPredictionsYet: "No predictions were submitted for this match.",
    deletePreMatchReportConfirm: "Delete this pre-match report?",
    noFunFacts: "No fun facts have been generated yet.",
    generatedOn: "Generated",
    deleteReportConfirm: "Delete this fun facts report?",
    predictionPoints: "Points",
    admin: "Admin",
    fixtureTimezone: "Fixture timezone",
    allDays: "All days",
    fullFixture: "Full fixture",
    match: "match",
    pluralMatches: "matches",
    noMatches: "No matches in this view.",
    finished: "Finished",
    inProgress: "In progress",
    onPenalties: "on penalties",
    yourLatestPrediction: "Your latest prediction",
    adminNoPredictions: "Admin accounts cannot submit predictions.",
    predictionsClosed: "Predictions are closed for this match.",
    goals: "goals",
    penaltyWinner: "Penalty winner",
    choose: "Choose",
    save: "Save",
    ranking: "Ranking",
    noPlayers: "No players yet.",
    predictionCount: "predictions",
    exactPredictionCount: "exact",
    scoring: "Scoring",
    groupSummary: "Exact score: 10 - correct outcome and goal difference: 7 - correct winner only: 4 - wrong shape or missing prediction: 0.",
    knockoutSummary: "Points rise by round. Predict the 120-minute score; if you predict a draw, choose who wins penalties.",
    timingSummary: "You can update a prediction until kickoff. The newest saved prediction is the one that counts.",
    groupStage: "Group stage",
    knockout: "Knockout",
    timing: "Timing",
    groupStageTitle: "Group Stage",
    predictionResult: "Prediction result",
    points: "Points",
    exactScoreRule: "Exact final score is predicted correctly.",
    diffRule: "Exact score is wrong, but the winner/draw and goal difference are correct.",
    winnerOnlyRule: "Only the match winner is predicted correctly.",
    wrongOutcomeRule: "The predicted outcome is different from the real outcome.",
    noPredictionRule: "No prediction was submitted before kickoff, or the prediction contradicts the real result.",
    knockoutPlayTitle: "Knockout Stage - Winner Decided During Play",
    knockoutPlayNote: "This applies when the winner is decided before penalties, including extra time.",
    round3216: "Round of 32 / 16",
    round32Only: "Round of 32",
    round16Only: "Round of 16",
    quarterFinal: "Quarter-final",
    quarterThird: "Quarter-final / Third place",
    semiFinal: "Semi-final",
    semiThird: "Semi-final / Third place",
    final: "Final",
    winnerDiffRule: "Winner and goal difference are correct.",
    winnerWrongNoDrawRule: "Winner prediction is wrong, but the prediction was not a draw.",
    penWinnerWhenActualInPlayRule: "Winner is predicted correctly, but as the penalty winner.",
    wrongDrawShapeRule: "Wrong winner with a draw/no prediction shape.",
    knockoutPensTitle: "Knockout Stage - Winner Decided By Penalties",
    knockoutPensNote: "Predict the score after 120 minutes. If you predict a draw, choose the penalty winner.",
    pensExactRule: "120-minute draw score and penalty winner are both correct.",
    pensWinnerRule: "120-minute draw is predicted and penalty winner is correct, but exact score is wrong.",
    pensExactWrongRule: "120-minute draw score is exact, but penalty winner is wrong.",
    pensWrongRule: "120-minute draw is predicted, but score and penalty winner are wrong.",
    pensLiveWinnerRule: "Winner is predicted correctly without predicting the 120-minute draw.",
    winnerWrongRule: "Winner is predicted wrong.",
    adminNotice: "Admin is available only when signed in with the admin username and password. Use this area to enter final scores and manage player accounts.",
    updateScore: "Update Score",
    updateFixture: "Update Fixture",
    userManagement: "User Management",
    preMatchReports: "Pre-Match Reports",
    generateFunFacts: "Generate Fun Facts",
    generatePreMatchReport: "Generate pre-match report",
    preMatchNotice: "After a match starts, generate the prediction distribution report for that match.",
    selectMatch: "Select match",
    rankingChart: "Ranking chart",
    showRankChart: "Rank graph",
    rankChartTitle: "Ranking changes for {name}",
    totalPointsChart: "Total points chart",
    showTotalPointsChart: "Points chart",
    pointsChartTitle: "Total points by player",
    noRankHistory: "No completed match days yet.",
    funFactsNotice: "After entering final scores, generate a playful recap for newly finished matches since the previous fun facts report.",
    funFactsLoading: "The report is being created. This can take about a minute.",
    matchDay: "Match day",
    generateReport: "Generate report",
    users: "Users",
    updateFixtureNotice: "After a stage finishes, replace placeholder names in the next-stage fixtures with the real teams.",
    updateFixtureButton: "Update fixture",
    addEditMatch: "Add or edit match",
    matchNumber: "Match number",
    stage: "Stage",
    home: "Home",
    away: "Away",
    group: "Group",
    kickoff: "Kickoff",
    venue: "Venue",
    saveMatch: "Save match",
    results: "Results",
    bulkImport: "Bulk fixture import",
    jsonMatches: "JSON matches",
    replaceFixture: "Replace fixture list",
    homeTeam: "Home team",
    awayTeam: "Away team",
    newPassword: "New password",
    keepPassword: "Leave blank to keep current",
    saveUser: "Save user",
    approveUser: "Approve user",
    pendingApproval: "Pending approval",
    approvedUser: "Approved",
    delete: "Delete",
    none: "None",
    saveResult: "Save result",
    clear: "Clear",
    deleteUserConfirm: "Delete {name} and all their predictions?",
    clearScoreConfirm: "Clear this score and remove its points from the ranking?",
    deleteMatchConfirm: "Delete this match and all predictions submitted for it?",
    stage_group: "Group",
    stage_round32: "Round of 32",
    stage_round16: "Round of 16",
    stage_quarter: "Quarter-final",
    stage_semi: "Semi-final",
    stage_third: "Third place",
    stage_final: "Final"
  },
  fa: {
    appTitle: "پیش‌بینی جام جهانی ۲۰۲۶",
    loginTitle: "مسابقه پیش‌بینی جام جهانی",
    loginIntro: "با حساب کاربری خود وارد شوید. حساب مدیر بخش مدیریت را نمایش می‌دهد.",
    privateContestNotice: "این یک مسابقه خصوصی پیش‌بینی بین دوستان است و وابسته به فیفا، جام جهانی فیفا یا برگزارکنندگان رسمی مسابقات نیست.",
    signupIntro: "یک بار حساب کاربری بسازید و هر روز برای ثبت یا ویرایش پیش‌بینی‌ها وارد شوید.",
    signupPending: "حساب شما ساخته شد و منتظر تأیید مدیر است. پس از تأیید می‌توانید وارد شوید.",
    language: "زبان",
    english: "انگلیسی",
    farsi: "فارسی",
    login: "ورود",
    signup: "ثبت‌نام",
    username: "نام کاربری",
    email: "نشانی ایمیل",
    screenName: "نام نمایشی",
    password: "رمز عبور",
    forgotPassword: "رمز عبور را فراموش کرده‌اید؟",
    forgotPasswordIntro: "نام کاربری خود را وارد کنید تا کد بازیابی به ایمیل ذخیره‌شده در حساب شما ارسال شود.",
    resetPassword: "بازیابی رمز عبور",
    resetPasswordIntro: "کد ارسال‌شده به ایمیل را وارد کنید و رمز عبور جدید انتخاب کنید.",
    resetCode: "کد بازیابی",
    sendResetCode: "ارسال کد بازیابی",
    resetCodeSent: "اگر این حساب ایمیل داشته باشد، کد بازیابی ارسال شد.",
    passwordResetDone: "رمز عبور تغییر کرد. اکنون می‌توانید با رمز جدید وارد شوید.",
    backToLogin: "بازگشت به ورود",
    createAccount: "ساخت حساب",
    matches: "بازی",
    players: "بازیکن",
    administrator: "مدیر",
    playerAccount: "حساب بازیکن",
    signOut: "خروج",
    account: "حساب کاربری",
    accountSettings: "تنظیمات حساب",
    accountNotice: "برای بازیابی رمز عبور، ایمیل خود را وارد کنید و نام نمایشی خود را در جدول رده‌بندی تغییر دهید. برای تغییر رمز عبور، رمز فعلی و رمز جدید را وارد کنید.",
    currentPassword: "رمز عبور فعلی",
    confirmNewPassword: "تکرار رمز عبور جدید",
    updateAccount: "به‌روزرسانی حساب",
    accountUpdated: "حساب به‌روزرسانی شد.",
    passwordMismatch: "رمزهای عبور جدید یکسان نیستند.",
    favoriteTeam: "تیم مورد علاقه",
    avatar: "تصویر پروفایل",
    avatarNotice: "یک عکس بارگذاری کنید، یا برای استفاده از پرچم تیم مورد علاقه این قسمت را خالی بگذارید.",
    uploadPhoto: "بارگذاری عکس",
    useTeamAvatar: "استفاده از آواتار تیم",
    photoTooLarge: "لطفاً یک تصویر کوچک‌تر انتخاب کنید.",
    predictions: "پیش‌بینی‌ها",
    scoringRules: "قوانین امتیازدهی",
    funFacts: "نکات جالب",
    matchReports: "گزارش‌های پیش از بازی",
    noMatchReports: "هنوز گزارشی برای پیش‌بینی‌های پیش از بازی ساخته نشده است.",
    preMatchReport: "گزارش پیش از بازی",
    predictionDistribution: "توزیع پیش‌بینی‌ها",
    mostFrequentScores: "نتیجه‌های پرتکرار",
    frequentPredictionSentence: "{count} نفر این بازی را {score} به نفع {team} پیش‌بینی کردند.",
    frequentDrawSentence: "{count} نفر این بازی را مساوی {score} پیش‌بینی کردند.",
    allPredictions: "همه پیش‌بینی‌ها",
    participantsPredicted: "{count} از {total} نفر برای این بازی پیش‌بینی ثبت کرده‌اند.",
    percentOfPlayers: "٪ از کل بازیکنان",
    percentOfPredictions: "٪ از پیش‌بینی‌ها",
    draw: "مساوی",
    noPredictionsYet: "برای این بازی پیش‌بینی ثبت نشده است.",
    deletePreMatchReportConfirm: "این گزارش پیش از بازی حذف شود؟",
    noFunFacts: "هنوز نکته جالبی ساخته نشده است.",
    generatedOn: "ساخته شده در",
    deleteReportConfirm: "این گزارش نکات جالب حذف شود؟",
    predictionPoints: "امتیاز",
    admin: "مدیریت",
    fixtureTimezone: "منطقه زمانی بازی‌ها",
    allDays: "همه روزها",
    fullFixture: "برنامه کامل",
    match: "بازی",
    pluralMatches: "بازی",
    noMatches: "در این بخش بازی‌ای وجود ندارد.",
    finished: "تمام شده",
    inProgress: "در حال برگزاری",
    onPenalties: "در ضربات پنالتی",
    yourLatestPrediction: "آخرین پیش‌بینی شما",
    adminNoPredictions: "حساب مدیر نمی‌تواند پیش‌بینی ثبت کند.",
    predictionsClosed: "مهلت پیش‌بینی برای این بازی تمام شده است.",
    goals: "گل",
    penaltyWinner: "برنده پنالتی",
    choose: "انتخاب کنید",
    save: "ذخیره",
    ranking: "جدول رده‌بندی",
    noPlayers: "هنوز بازیکنی وجود ندارد.",
    predictionCount: "پیش‌بینی",
    scoring: "امتیازدهی",
    groupSummary: "نتیجه دقیق: ۱۰ - نتیجه و اختلاف گل درست: ۷ - فقط برنده درست: ۴ - حالت اشتباه یا عدم پیش‌بینی: ۰.",
    knockoutSummary: "امتیازها با توجه به مرحله بیشتر می‌شوند. نتیجه پس از ۱۲۰ دقیقه را پیش‌بینی کنید؛ اگر مساوی پیش‌بینی می‌کنید، برنده پنالتی را هم انتخاب کنید.",
    timingSummary: "تا قبل از شروع بازی می‌توانید پیش‌بینی را تغییر دهید. آخرین پیش‌بینی ذخیره‌شده محاسبه می‌شود.",
    groupStage: "مرحله گروهی",
    knockout: "حذفی",
    timing: "زمان‌بندی",
    groupStageTitle: "مرحله گروهی",
    predictionResult: "وضعیت پیش‌بینی",
    points: "امتیاز",
    exactScoreRule: "نتیجه نهایی بازی دقیقاً درست پیش‌بینی شود.",
    diffRule: "نتیجه دقیق اشتباه باشد، اما برنده/مساوی و اختلاف گل درست باشد.",
    winnerOnlyRule: "فقط برنده بازی درست پیش‌بینی شود.",
    wrongOutcomeRule: "حالت پیش‌بینی‌شده با نتیجه واقعی متفاوت باشد.",
    noPredictionRule: "قبل از شروع بازی پیش‌بینی ثبت نشده باشد، یا پیش‌بینی خلاف نتیجه واقعی باشد.",
    knockoutPlayTitle: "مرحله حذفی - برنده در جریان بازی مشخص شود",
    knockoutPlayNote: "این حالت زمانی است که برنده قبل از ضربات پنالتی، از جمله در وقت اضافه، مشخص شود.",
    round3216: "یک‌شانزدهم / یک‌هشتم نهایی",
    round32Only: "یک‌شانزدهم نهایی",
    round16Only: "یک‌هشتم نهایی",
    quarterFinal: "یک‌چهارم نهایی",
    quarterThird: "یک‌چهارم نهایی / رده‌بندی",
    semiFinal: "نیمه‌نهایی",
    semiThird: "نیمه‌نهایی / رده‌بندی",
    final: "فینال",
    winnerDiffRule: "برنده و اختلاف گل درست باشد.",
    winnerWrongNoDrawRule: "برنده اشتباه باشد، اما پیش‌بینی مساوی نبوده باشد.",
    penWinnerWhenActualInPlayRule: "برنده درست پیش‌بینی شود، اما به عنوان برنده ضربات پنالتی.",
    wrongDrawShapeRule: "برنده اشتباه با حالت مساوی یا عدم پیش‌بینی.",
    knockoutPensTitle: "مرحله حذفی - برنده در ضربات پنالتی مشخص شود",
    knockoutPensNote: "نتیجه پس از ۱۲۰ دقیقه را پیش‌بینی کنید. اگر مساوی پیش‌بینی می‌کنید، برنده پنالتی را انتخاب کنید.",
    pensExactRule: "نتیجه مساوی پس از ۱۲۰ دقیقه و برنده پنالتی هر دو درست باشد.",
    pensWinnerRule: "مساوی پس از ۱۲۰ دقیقه و برنده پنالتی درست باشد، اما نتیجه دقیق اشتباه باشد.",
    pensExactWrongRule: "نتیجه مساوی پس از ۱۲۰ دقیقه دقیق باشد، اما برنده پنالتی اشتباه باشد.",
    pensWrongRule: "مساوی پیش‌بینی شود، اما نتیجه و برنده پنالتی اشتباه باشد.",
    pensLiveWinnerRule: "برنده درست پیش‌بینی شود، بدون اینکه مساوی پس از ۱۲۰ دقیقه پیش‌بینی شده باشد.",
    winnerWrongRule: "برنده اشتباه پیش‌بینی شود.",
    adminNotice: "بخش مدیریت فقط با حساب مدیر نمایش داده می‌شود. در این بخش می‌توانید نتایج را ثبت کنید و حساب کاربران را مدیریت کنید.",
    updateScore: "به‌روزرسانی نتیجه",
    updateFixture: "به‌روزرسانی برنامه",
    userManagement: "مدیریت کاربران",
    preMatchReports: "گزارش‌های پیش از بازی",
    generateFunFacts: "ساخت نکات جالب",
    generatePreMatchReport: "ساخت گزارش پیش از بازی",
    preMatchNotice: "پس از شروع بازی، گزارش توزیع پیش‌بینی‌ها را برای آن بازی بسازید.",
    selectMatch: "انتخاب بازی",
    rankingChart: "نمودار رتبه",
    showRankChart: "نمودار رتبه",
    rankChartTitle: "تغییرات رتبه {name}",
    totalPointsChart: "نمودار امتیاز کل",
    showTotalPointsChart: "نمودار امتیاز",
    pointsChartTitle: "امتیاز کل بازیکنان",
    noRankHistory: "هنوز روز بازی تمام‌شده‌ای وجود ندارد.",
    funFactsNotice: "پس از ثبت نتایج نهایی یک روز، با OpenAI یک گزارش کوتاه و سرگرم‌کننده بسازید.",
    funFactsLoading: "گزارش در حال ساخته شدن است. این کار ممکن است حدود یک دقیقه طول بکشد.",
    matchDay: "روز بازی",
    generateReport: "ساخت گزارش",
    users: "کاربران",
    updateFixtureNotice: "پس از پایان هر مرحله، نام‌های جایگزین مرحله بعد را با نام تیم‌های واقعی عوض کنید.",
    updateFixtureButton: "به‌روزرسانی برنامه",
    addEditMatch: "افزودن یا ویرایش بازی",
    matchNumber: "شماره بازی",
    stage: "مرحله",
    home: "میزبان",
    away: "مهمان",
    group: "گروه",
    kickoff: "زمان شروع",
    venue: "ورزشگاه",
    saveMatch: "ذخیره بازی",
    results: "نتایج",
    bulkImport: "ورود گروهی برنامه",
    jsonMatches: "بازی‌ها با فرمت JSON",
    replaceFixture: "جایگزینی برنامه بازی‌ها",
    homeTeam: "تیم اول",
    awayTeam: "تیم دوم",
    newPassword: "رمز عبور جدید",
    keepPassword: "برای حفظ رمز فعلی خالی بگذارید",
    saveUser: "ذخیره کاربر",
    approveUser: "تأیید کاربر",
    pendingApproval: "در انتظار تأیید",
    approvedUser: "تأیید شده",
    delete: "حذف",
    none: "هیچ‌کدام",
    saveResult: "ذخیره نتیجه",
    clear: "پاک کردن",
    deleteUserConfirm: "آیا {name} و همه پیش‌بینی‌هایش حذف شود؟",
    clearScoreConfirm: "این نتیجه پاک شود و امتیازهای مربوط به آن از جدول حذف شود؟",
    deleteMatchConfirm: "این بازی و همه پیش‌بینی‌های ثبت‌شده برای آن حذف شود؟",
    stage_group: "گروهی",
    stage_round32: "یک‌شانزدهم نهایی",
    stage_round16: "یک‌هشتم نهایی",
    stage_quarter: "یک‌چهارم نهایی",
    stage_semi: "نیمه‌نهایی",
    stage_third: "رده‌بندی",
    stage_final: "فینال"
  }
};

const timezones = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Mexico_City",
  "America/Vancouver",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Tehran",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney"
];

const flags = {
  Algeria: "dz",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  "Bosnia and Herzegovina": "ba",
  Brazil: "br",
  Canada: "ca",
  "Cape Verde": "cv",
  Colombia: "co",
  Croatia: "hr",
  Curacao: "cw",
  Czechia: "cz",
  "DR Congo": "cd",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Haiti: "ht",
  Iran: "ir",
  Iraq: "iq",
  "Ivory Coast": "ci",
  Japan: "jp",
  Jordan: "jo",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  "New Zealand": "nz",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Portugal: "pt",
  Qatar: "qa",
  "Saudi Arabia": "sa",
  Scotland: "gb-sct",
  Senegal: "sn",
  "South Africa": "za",
  "South Korea": "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Tunisia: "tn",
  Turkiye: "tr",
  Uruguay: "uy",
  "United States": "us",
  Uzbekistan: "uz"
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function t(key, values = {}) {
  const template = translations[state.lang]?.[key] || translations.en[key] || key;
  return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function stageLabel(stage) {
  return t(`stage_${stage}`);
}

function locale() {
  return state.lang === "fa" ? "fa-IR-u-ca-persian" : undefined;
}

function applyLanguageDirection() {
  document.documentElement.lang = state.lang === "fa" ? "fa" : "en";
  document.documentElement.dir = state.lang === "fa" ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", state.lang === "fa");
}

function languageSelector(id = "language-select") {
  return `
    <label class="language-control">${t("language")}
      <select id="${id}">
        <option value="en" ${state.lang === "en" ? "selected" : ""}>${t("english")}</option>
        <option value="fa" ${state.lang === "fa" ? "selected" : ""}>${t("farsi")}</option>
      </select>
    </label>
  `;
}

function wireLanguageSelector(selector = "#language-select") {
  document.querySelector(selector)?.addEventListener("change", event => {
    state.lang = event.target.value;
    localStorage.setItem("wc-lang", state.lang);
    render();
  });
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { "X-Auth-Token": state.token } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}

async function load() {
  if (state.token) {
    const payload = await api("/api/me");
    state.user = payload.user;
    state.data = payload.state;
    if (!state.user) {
      state.token = "";
      localStorage.removeItem("wc-token");
      localStorage.removeItem("wc-user");
    }
  } else {
    state.data = await api("/api/state");
  }
  render();
}

function formatKickoff(value) {
  return new Intl.DateTimeFormat(locale(), {
    timeZone: state.timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function dateKey(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: state.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const get = type => parts.find(part => part.type === type).value;
  const year = get("year");
  const month = get("month");
  const day = get("day");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return dateKey(new Date().toISOString());
}

function reportDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDay(value) {
  return new Intl.DateTimeFormat(locale(), {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function formatReportPeriod(report) {
  if (!report.periodStart || !report.periodEnd) return report.date || "";
  const start = formatKickoff(report.periodStart);
  const end = formatKickoff(report.periodEnd);
  return start === end ? start : `${start} - ${end}`;
}

function statusPill(match) {
  if (match.status === "finished") return `<span class="pill done">${t("finished")}</span>`;
  if (match.status === "live") return `<span class="pill live">${t("inProgress")}</span>`;
  return `<span class="pill">${formatKickoff(match.kickoff)}</span>`;
}

function latestPrediction(matchId) {
  if (!state.user || state.user.isAdmin) return null;
  return state.data.predictions[`${state.user.id}:${matchId}`] || null;
}

function isLocked(match) {
  return Date.now() >= new Date(match.kickoff).getTime();
}

function penaltyNote(match) {
  if (!match.penaltyWinner) return "";
  return `${match.penaltyWinner === "home" ? match.home : match.away} ${t("onPenalties")}`;
}

function teamLabel(team) {
  const code = flags[team] || "";
  const flag = code ? `<img class="flag" src="https://flagcdn.com/w40/${code}.png" alt="" loading="lazy">` : "";
  return `<span class="team-name">${flag}<span>${escapeHtml(team)}</span></span>`;
}

function favoriteTeamOptions(selected = "") {
  return `
    <option value="">${t("choose")}</option>
    ${Object.keys(flags).sort((a, b) => a.localeCompare(b)).map(team => (
      `<option value="${escapeHtml(team)}" ${team === selected ? "selected" : ""}>${escapeHtml(team)}</option>`
    )).join("")}
  `;
}

function playerAvatar(player, size = "small") {
  const name = player?.name || player?.screenName || player?.username || "";
  const initial = escapeHtml(String(name).trim().charAt(0).toUpperCase() || "?");
  if (player?.avatarDataUrl) {
    return `<span class="player-avatar ${size}"><img src="${player.avatarDataUrl}" alt="" loading="lazy"></span>`;
  }
  const code = flags[player?.favoriteTeam] || "";
  if (code) {
    return `<span class="player-avatar ${size} team-avatar"><img src="https://flagcdn.com/w80/${code}.png" alt="" loading="lazy"></span>`;
  }
  return `<span class="player-avatar ${size} initial-avatar">${initial}</span>`;
}

function rankingAvatar(player) {
  const crown = Number(player.rank) === 1 ? `<span class="leader-crown" aria-hidden="true"></span>` : "";
  return `
    <span class="rank-avatar-wrap" tabindex="0" aria-label="${escapeHtml(player.name)}">
      ${crown}
      ${playerAvatar(player)}
      <span class="avatar-popover">
        ${playerAvatar(player, "large")}
        <span>
          <strong>${escapeHtml(player.name)}</strong>
          <span>${t("favoriteTeam")}: ${escapeHtml(player.favoriteTeam || t("none"))}</span>
        </span>
      </span>
    </span>
  `;
}

function brandImages() {
  return `
    <div class="brand-media" aria-label="World Cup 2026 prediction contest">
      <span class="brand-mark" aria-hidden="true">26</span>
    </div>
  `;
}

function renderLogin() {
  applyLanguageDirection();
  const isSignup = state.authMode === "signup";
  const isForgot = state.authMode === "forgot";
  const isReset = state.authMode === "reset";
  const intro = isForgot ? t("forgotPasswordIntro") : isReset ? t("resetPasswordIntro") : isSignup ? t("signupIntro") : t("loginIntro");
  const title = isForgot || isReset ? t("resetPassword") : t("loginTitle");
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-visual" aria-label="Private World Cup prediction contest">
        <div class="private-hero-mark" aria-hidden="true">
          <span>26</span>
        </div>
        <h2>${t("appTitle")}</h2>
        <p>${t("privateContestNotice")}</p>
      </section>
      <section class="login">
        ${languageSelector()}
        <h1>${title}</h1>
        <p>${intro}</p>
        <div class="notice login-disclaimer">${t("privateContestNotice")}</div>
        <div class="auth-tabs ${isForgot || isReset ? "hidden" : ""}">
          <button class="tab ${!isSignup ? "active" : ""}" data-auth-mode="login">${t("login")}</button>
          <button class="tab ${isSignup ? "active" : ""}" data-auth-mode="signup">${t("signup")}</button>
        </div>
        <form id="auth-form">
          <label>${t("username")}<input name="username" autocomplete="username" pattern="[a-z0-9_]{3,24}" value="${escapeHtml(state.resetUsername || "")}" required></label>
          ${isSignup ? `<label>${t("email")}<input name="email" type="email" autocomplete="email" required></label>` : ""}
          ${isSignup ? `<label>${t("screenName")}<input name="screenName" autocomplete="nickname" maxlength="40" required></label>` : ""}
          ${isForgot ? "" : isReset ? `
            <label>${t("resetCode")}<input name="code" inputmode="numeric" autocomplete="one-time-code" required></label>
            <label>${t("newPassword")}<input name="password" type="password" autocomplete="new-password" minlength="6" required></label>
            <label>${t("confirmNewPassword")}<input name="confirmPassword" type="password" autocomplete="new-password" minlength="6" required></label>
          ` : `<label>${t("password")}<input name="password" type="password" autocomplete="${isSignup ? "new-password" : "current-password"}" minlength="6" required></label>`}
          <button>${isForgot ? t("sendResetCode") : isReset ? t("resetPassword") : isSignup ? t("createAccount") : t("login")}</button>
          ${!isSignup && !isForgot && !isReset ? `<button type="button" class="ghost" id="forgot-password">${t("forgotPassword")}</button>` : ""}
          ${isForgot || isReset ? `<button type="button" class="ghost" id="back-to-login">${t("backToLogin")}</button>` : ""}
          <div class="error" id="auth-error"></div>
          <div class="success" id="auth-success">${state.authNotice ? t(state.authNotice) : ""}</div>
        </form>
      </section>
    </main>
  `;
  wireLanguageSelector();
  document.querySelectorAll("[data-auth-mode]").forEach(button => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.authMode;
      state.authNotice = "";
      renderLogin();
    });
  });
  document.querySelector("#forgot-password")?.addEventListener("click", () => {
    state.authMode = "forgot";
    state.authNotice = "";
    renderLogin();
  });
  document.querySelector("#back-to-login")?.addEventListener("click", () => {
    state.authMode = "login";
    state.authNotice = "";
    renderLogin();
  });
  document.querySelector("#auth-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const error = document.querySelector("#auth-error");
    state.authNotice = "";
    error.textContent = "";
    if (state.authMode === "reset" && form.elements.password.value !== form.elements.confirmPassword.value) {
      error.textContent = t("passwordMismatch");
      return;
    }
    try {
      if (state.authMode === "forgot") {
        await api("/api/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ username: form.elements.username.value })
        });
        state.resetUsername = form.elements.username.value;
        state.authMode = "reset";
        state.authNotice = "resetCodeSent";
        renderLogin();
        return;
      }
      if (state.authMode === "reset") {
        await api("/api/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({
            username: form.elements.username.value,
            code: form.elements.code.value,
            password: form.elements.password.value
          })
        });
        state.authMode = "login";
        state.authNotice = "passwordResetDone";
        renderLogin();
        return;
      }
      const payload = await api(`/api/auth/${state.authMode}`, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      if (payload.pending) {
        state.authMode = "login";
        state.authNotice = "signupPending";
        state.data = payload.state;
        renderLogin();
        return;
      }
      state.token = payload.token;
      state.user = payload.user;
      state.data = payload.state;
      state.tab = state.user.isAdmin ? "admin" : "matches";
      localStorage.setItem("wc-token", state.token);
      localStorage.setItem("wc-user", JSON.stringify(state.user));
      render();
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

function render() {
  if (!state.data) return;
  if (!state.user) return renderLogin();
  applyLanguageDirection();
  if (!state.user.isAdmin && state.tab === "admin") state.tab = "matches";
  if (state.user.isAdmin && state.tab === "account") state.tab = "admin";
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand">
          ${brandImages()}
          <div>
            <h1>${t("appTitle")}</h1>
            <p>${state.data.matches.length} ${t("matches")} - ${state.data.players.length} ${t("players")}</p>
          </div>
        </div>
        <div class="userbar">
          ${languageSelector("language-select-header")}
          <div><strong>${escapeHtml(state.user.name)}</strong><p>${state.user.isAdmin ? t("administrator") : t("playerAccount")}</p></div>
          <button class="ghost" id="sign-out">${t("signOut")}</button>
        </div>
      </header>
      <section class="content">
        <div>
          <nav class="tabs">
            ${tabButton("matches", t("predictions"))}
            ${tabButton("fun", t("funFacts"))}
            ${tabButton("matchReports", t("matchReports"))}
            ${tabButton("rules", t("scoringRules"))}
            ${!state.user.isAdmin ? tabButton("account", t("account")) : ""}
            ${state.user.isAdmin ? tabButton("admin", t("admin")) : ""}
          </nav>
          ${state.tab === "matches" ? renderMatches() : ""}
          ${state.tab === "fun" ? renderFunFactsPage() : ""}
          ${state.tab === "matchReports" ? renderMatchReportsPage() : ""}
          ${state.tab === "rules" ? renderRulesPage() : ""}
          ${state.tab === "account" ? renderAccountPage() : ""}
          ${state.tab === "admin" ? renderAdmin() : ""}
        </div>
        <aside class="side">
          ${renderRanking()}
          ${renderRules()}
        </aside>
      </section>
    </main>
  `;
  wireCommon();
  if (state.tab === "matches") wireMatches();
  if (state.tab === "account") wireAccount();
  if (state.tab === "admin") wireAdmin();
  if (state.tab === "matchReports") drawPredictionPieCharts();
  if (state.tab === "matches") scrollToTodayMatch();
}

function tabButton(tab, label) {
  return `<button class="tab ${state.tab === tab ? "active" : ""}" data-tab="${tab}">${label}</button>`;
}

function renderMatches() {
  const days = [...new Set(state.data.matches.map(match => dateKey(match.kickoff)))];
  const activeDay = state.day === "all" || days.includes(state.day) ? state.day : "all";
  state.day = activeDay;
  const matches = state.data.matches.filter(match => activeDay === "all" || dateKey(match.kickoff) === activeDay);
  return `
    <div class="panel timezone-panel">
      <label>${t("fixtureTimezone")}
        <select id="timezone-select">
          ${timezoneOptions()}
        </select>
      </label>
    </div>
    <div class="tabs">
      <button class="tab ${activeDay === "all" ? "active" : ""}" data-day="all">${t("allDays")}</button>
      ${days.map(day => `<button class="tab ${activeDay === day ? "active" : ""}" data-day="${day}">${formatDay(day)}</button>`).join("")}
    </div>
    <div class="panel day-summary">
      <strong>${activeDay === "all" ? t("fullFixture") : formatDay(activeDay)}</strong>
      <span>${matches.length} ${matches.length === 1 ? t("match") : t("pluralMatches")}</span>
    </div>
    <div class="match-list">
      ${matches.length ? matches.map(renderMatch).join("") : `<div class="panel empty">${t("noMatches")}</div>`}
    </div>
  `;
}

function scrollToTodayMatch() {
  if (!state.autoScrollToToday || state.day !== "all") return;
  state.autoScrollToToday = false;
  const today = todayKey();
  requestAnimationFrame(() => {
    const match = document.querySelector(`.match[data-match-day="${today}"]`);
    match?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function timezoneOptions() {
  const zones = [...new Set([state.timezone, ...timezones])];
  return zones.map(zone => `<option value="${escapeHtml(zone)}" ${zone === state.timezone ? "selected" : ""}>${escapeHtml(zone)}</option>`).join("");
}

function renderMatch(match) {
  const prediction = latestPrediction(match.id);
  const locked = isLocked(match);
  const canSubmit = !state.user.isAdmin && !locked;
  const predictionPoints = prediction && match.status === "finished" ? scorePredictionPreview(match, prediction) : null;
  return `
    <article class="match" data-match-day="${dateKey(match.kickoff)}">
      <div class="match-head">
        <div>
          <div class="meta">${t("matchNumber")} ${match.number} - ${stageLabel(match.stage) || match.stage}${match.group ? ` - ${t("group")} ${escapeHtml(match.group)}` : ""}</div>
          <div class="teams">
            <div class="team-row"><span class="team">${teamLabel(match.home)}</span><span class="scoreline">${Number.isFinite(match.homeScore) ? match.homeScore : ""}</span></div>
            <div class="team-row"><span class="team">${teamLabel(match.away)}</span><span class="scoreline">${Number.isFinite(match.awayScore) ? match.awayScore : "vs"}</span></div>
          </div>
          ${penaltyNote(match) ? `<div class="meta">${escapeHtml(penaltyNote(match))}</div>` : ""}
          <div class="meta">${escapeHtml(match.venue || "")}</div>
        </div>
        ${statusPill(match)}
      </div>
      ${prediction ? `<div class="notice prediction-notice"><span>${t("yourLatestPrediction")}: ${prediction.homeScore}-${prediction.awayScore}${prediction.penaltyWinner ? `, ${prediction.penaltyWinner === "home" ? escapeHtml(match.home) : escapeHtml(match.away)} ${t("onPenalties")}` : ""}</span>${predictionPoints !== null ? `<strong>${t("predictionPoints")}: ${predictionPoints}</strong>` : ""}</div>` : ""}
      ${canSubmit ? renderPredictionForm(match) : `<div class="locked">${state.user.isAdmin ? t("adminNoPredictions") : t("predictionsClosed")}</div>`}
    </article>
  `;
}

function matchOutcome(home, away) {
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

function predictionWinner(prediction) {
  const outcome = matchOutcome(prediction.homeScore, prediction.awayScore);
  if (outcome === "draw") return prediction.penaltyWinner || "draw";
  return outcome;
}

function matchWinner(match) {
  const outcome = matchOutcome(match.homeScore, match.awayScore);
  if (outcome === "draw") return match.penaltyWinner || "draw";
  return outcome;
}

const pointPreview = {
  round32: { exact: 15, diff: 11, winner: 7, penWinnerWhenActualInPlay: 3, penExact: 15, penDrawWinner: 9, penExactWrongWinner: 11, penDrawWrongWinner: 6, liveWinner: 3 },
  round16: { exact: 20, diff: 15, winner: 10, penWinnerWhenActualInPlay: 5, penExact: 20, penDrawWinner: 12, penExactWrongWinner: 15, penDrawWrongWinner: 8, liveWinner: 4 },
  quarter: { exact: 25, diff: 19, winner: 13, penWinnerWhenActualInPlay: 7, penExact: 25, penDrawWinner: 15, penExactWrongWinner: 19, penDrawWrongWinner: 10, liveWinner: 5 },
  third: { exact: 25, diff: 19, winner: 13, penWinnerWhenActualInPlay: 7, penExact: 25, penDrawWinner: 15, penExactWrongWinner: 19, penDrawWrongWinner: 10, liveWinner: 5 },
  semi: { exact: 30, diff: 23, winner: 16, penWinnerWhenActualInPlay: 9, penExact: 30, penDrawWinner: 18, penExactWrongWinner: 23, penDrawWrongWinner: 12, liveWinner: 6 },
  final: { exact: 35, diff: 27, winner: 19, penWinnerWhenActualInPlay: 11, penExact: 35, penDrawWinner: 21, penExactWrongWinner: 27, penDrawWrongWinner: 14, liveWinner: 7 }
};

function scorePredictionPreview(match, prediction) {
  if (!prediction || match.status !== "finished" || !Number.isFinite(match.homeScore) || !Number.isFinite(match.awayScore)) return 0;
  const actualOutcome = matchOutcome(match.homeScore, match.awayScore);
  const predictedOutcome = matchOutcome(prediction.homeScore, prediction.awayScore);
  if (match.stage === "group") {
    const actualDiff = match.homeScore - match.awayScore;
    const predictedDiff = prediction.homeScore - prediction.awayScore;
    if (match.homeScore === prediction.homeScore && match.awayScore === prediction.awayScore) return 10;
    if (actualOutcome === predictedOutcome && actualDiff === predictedDiff) return 7;
    if (actualOutcome === predictedOutcome && actualOutcome !== "draw") return 4;
    return 0;
  }

  const table = pointPreview[match.stage] || pointPreview.round32;
  const actualWinner = matchWinner(match);
  const predictedWinner = predictionWinner(prediction);
  const exactScore = match.homeScore === prediction.homeScore && match.awayScore === prediction.awayScore;
  const sameDiff = (match.homeScore - match.awayScore) === (prediction.homeScore - prediction.awayScore);
  if (match.penaltyWinner) {
    if (predictedOutcome === "draw" && exactScore && predictedWinner === actualWinner) return table.penExact;
    if (predictedOutcome === "draw" && predictedWinner === actualWinner) return table.penDrawWinner;
    if (predictedOutcome === "draw" && exactScore && predictedWinner !== actualWinner) return table.penExactWrongWinner;
    if (predictedOutcome === "draw") return table.penDrawWrongWinner;
    if (predictedWinner === actualWinner) return table.liveWinner;
    return 0;
  }
  if (exactScore) return table.exact;
  if (actualOutcome === predictedOutcome && sameDiff) return table.diff;
  if (predictedOutcome === "draw" && predictedWinner === actualWinner) return table.penWinnerWhenActualInPlay;
  if (actualWinner === predictedWinner) return table.winner;
  return 0;
}

function buildRankHistory(playerId) {
  const dates = [...new Set(state.data.matches.filter(match => match.status === "finished").map(match => reportDateKey(match.kickoff)))].sort();
  return dates.map(date => {
    const matches = state.data.matches.filter(match => match.status === "finished" && reportDateKey(match.kickoff) <= date);
    const standings = calculatePreviewStandings(matches);
    const index = standings.findIndex(player => player.id === playerId);
    const player = standings[index];
    return player ? { date, rank: player.rank || index + 1, points: player.points } : null;
  }).filter(Boolean);
}

function calculatePreviewStandings(matches) {
  const standings = state.data.players.map(player => {
    let points = 0;
    let exacts = 0;
    let predicted = 0;
    for (const match of matches) {
      const prediction = state.data.predictions[`${player.id}:${match.id}`] || null;
      if (prediction) predicted += 1;
      const matchPoints = scorePredictionPreview(match, prediction);
      points += matchPoints;
      if (isExactScorePrediction(match, prediction)) exacts += 1;
    }
    return { ...player, points: Math.round((points + Number.EPSILON) * 100) / 100, exacts, predicted };
  }).sort((a, b) => b.points - a.points || b.exacts - a.exacts || a.name.localeCompare(b.name));
  return withCompetitionRanks(standings);
}

function isExactScorePrediction(match, prediction) {
  return Boolean(
    match &&
    prediction &&
    match.status === "finished" &&
    match.homeScore === prediction.homeScore &&
    match.awayScore === prediction.awayScore
  );
}

function withCompetitionRanks(standings) {
  let previousPoints = null;
  let previousExacts = null;
  let rank = 0;
  return standings.map((player, index) => {
    if (index === 0 || player.points !== previousPoints || player.exacts !== previousExacts) {
      rank = index + 1;
      previousPoints = player.points;
      previousExacts = player.exacts;
    }
    return { ...player, rank };
  });
}

function drawRankChart() {
  const canvas = document.querySelector("#rank-chart");
  if (!canvas || !state.chartPlayerId) return;
  const player = state.data.players.find(item => item.id === state.chartPlayerId);
  const history = buildRankHistory(state.chartPlayerId);
  if (!player || !history.length) return;
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 980;
  const cssHeight = canvas.clientHeight || 460;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const pad = { top: 56, right: 28, bottom: 110, left: 48 };
  const plotW = cssWidth - pad.left - pad.right;
  const plotH = cssHeight - pad.top - pad.bottom;
  const maxRank = Math.max(5, state.data.players.length, ...history.map(item => item.rank));
  const x = index => pad.left + (history.length === 1 ? plotW / 2 : (index / (history.length - 1)) * plotW);
  const y = rank => pad.top + ((rank - 1) / Math.max(1, maxRank - 1)) * plotH;

  ctx.fillStyle = "#fac18e";
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = "#cfe1a8";
  ctx.fillRect(pad.left, pad.top, plotW, plotH);
  ctx.strokeStyle = "#4d5d45";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad.left, pad.top, plotW, plotH);

  ctx.strokeStyle = "rgba(70, 95, 70, 0.45)";
  ctx.fillStyle = "#1c1c1c";
  ctx.font = "13px Segoe UI, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const step = Math.max(1, Math.ceil(maxRank / 8));
  for (let rank = 1; rank <= maxRank; rank += step) {
    const yy = y(rank);
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(pad.left + plotW, yy);
    ctx.stroke();
    ctx.fillText(rank, pad.left - 10, yy);
  }

  ctx.fillStyle = "#0f1115";
  ctx.font = "700 24px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(t("rankChartTitle", { name: player.name }), cssWidth / 2, 18);

  ctx.strokeStyle = "#3f7ebc";
  ctx.fillStyle = "#3f7ebc";
  ctx.lineWidth = 4;
  ctx.beginPath();
  history.forEach((item, index) => {
    const xx = x(index);
    const yy = y(item.rank);
    if (index === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  });
  ctx.stroke();

  history.forEach((item, index) => {
    const xx = x(index);
    const yy = y(item.rank);
    ctx.beginPath();
    ctx.arc(xx, yy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0b0d10";
    ctx.font = "700 14px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(item.rank, xx, yy - 10);
    ctx.fillStyle = "#3f7ebc";
  });

  ctx.fillStyle = "#0b0d10";
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  history.forEach((item, index) => {
    const xx = x(index);
    ctx.save();
    ctx.translate(xx, pad.top + plotH + 18);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(formatDay(item.date), 0, 0);
    ctx.restore();
  });
}

function drawPointsBarChart() {
  const canvas = document.querySelector("#points-chart");
  const standings = state.data?.standings || [];
  if (!canvas || !standings.length) return;
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 980;
  const cssHeight = canvas.clientHeight || 620;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const pad = { top: 58, right: 26, bottom: 188, left: 54 };
  const plotW = cssWidth - pad.left - pad.right;
  const plotH = cssHeight - pad.top - pad.bottom;
  const labelTop = pad.top + plotH;
  const rankTop = cssHeight - 34;
  const maxActualPoints = Math.max(5, ...standings.map(player => Number(player.points) || 0));
  const maxPoints = Math.ceil((maxActualPoints * 1.12) / 10) * 10;
  const y = points => pad.top + plotH - (points / maxPoints) * plotH;

  ctx.fillStyle = "#fac18e";
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = "#cfe1a8";
  ctx.fillRect(pad.left, pad.top, plotW, plotH);
  ctx.strokeStyle = "#4d5d45";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad.left, pad.top, plotW, plotH);
  ctx.fillStyle = "#efb4b7";
  ctx.fillRect(pad.left, labelTop, plotW, cssHeight - labelTop);
  ctx.strokeStyle = "rgba(77, 93, 69, 0.72)";
  ctx.beginPath();
  ctx.moveTo(pad.left, labelTop);
  ctx.lineTo(pad.left + plotW, labelTop);
  ctx.moveTo(pad.left, rankTop);
  ctx.lineTo(pad.left + plotW, rankTop);
  ctx.stroke();

  ctx.strokeStyle = "rgba(70, 95, 70, 0.45)";
  ctx.fillStyle = "#1c1c1c";
  ctx.font = "13px Segoe UI, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const step = Math.max(1, Math.ceil(maxPoints / 8));
  for (let value = 0; value <= maxPoints; value += step) {
    const yy = y(value);
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(pad.left + plotW, yy);
    ctx.stroke();
    ctx.fillText(value, pad.left - 10, yy);
  }

  ctx.fillStyle = "#0f1115";
  ctx.font = "700 24px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(t("pointsChartTitle"), cssWidth / 2, 18);

  const slot = plotW / standings.length;
  const barW = Math.min(38, Math.max(12, slot * 0.36));
  standings.forEach((player, index) => {
    const points = Number(player.points) || 0;
    const x = pad.left + slot * index + slot / 2 - barW / 2;
    const yy = y(points);
    const height = pad.top + plotH - yy;
    const gradient = ctx.createLinearGradient(0, yy, 0, pad.top + plotH);
    gradient.addColorStop(0, "#3f7ebc");
    gradient.addColorStop(1, "#245a92");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, yy, barW, height);
    ctx.strokeStyle = "#2d5f91";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, yy, barW, height);

    ctx.fillStyle = "#0b0d10";
    ctx.font = "700 13px Segoe UI, sans-serif";
    ctx.save();
    ctx.translate(x + barW / 2, yy - 14);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(points, 0, 0);
    ctx.restore();

    const slotLeft = pad.left + slot * index;
    const slotCenter = slotLeft + slot / 2;
    ctx.strokeStyle = "rgba(77, 93, 69, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(slotLeft, labelTop);
    ctx.lineTo(slotLeft, cssHeight);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(slotLeft + 2, labelTop + 4, Math.max(1, slot - 4), rankTop - labelTop - 8);
    ctx.clip();
    ctx.translate(slotCenter, rankTop - 9);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#1f1f1f";
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(player.name, 0, 0);
    ctx.restore();

    ctx.fillStyle = "#0b0d10";
    ctx.font = "700 13px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(player.rank || index + 1, slotCenter, rankTop + 17);
  });
  ctx.strokeStyle = "rgba(77, 93, 69, 0.45)";
  ctx.beginPath();
  ctx.moveTo(pad.left + plotW, labelTop);
  ctx.lineTo(pad.left + plotW, cssHeight);
  ctx.stroke();
}

function drawPredictionPieCharts() {
  document.querySelectorAll(".prediction-pie").forEach(canvas => {
    const reportId = canvas.id.replace(/^pie-/, "");
    const report = (state.data.preMatchReports || []).find(item => item.id === reportId);
    if (!report) return;
    drawPredictionPie(canvas, report);
  });
}

function drawPredictionPie(canvas, report) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || 360;
  const cssHeight = canvas.clientHeight || 260;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const values = (report.outcomes || []).map(item => ({ ...item, value: item.count || 0 }));
  const total = values.reduce((sum, item) => sum + item.value, 0);
  const cx = cssWidth / 2;
  const cy = cssHeight / 2 + 8;
  const radius = Math.min(cssWidth, cssHeight) * 0.28;
  const colors = { home: "#1f77b4", draw: "#c9a227", away: "#d95f50" };

  ctx.fillStyle = "#f7fafc";
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = "#17202a";
  ctx.font = "700 15px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${report.home} vs ${report.away}`, cx, 22);

  if (!total) {
    ctx.fillStyle = "#627084";
    ctx.font = "14px Segoe UI, sans-serif";
    ctx.fillText(t("noPredictionsYet"), cx, cy);
    return;
  }

  let angle = -Math.PI / 2;
  for (const item of values) {
    const slice = (item.value / total) * Math.PI * 2;
    if (slice > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[item.key] || "#627084";
      ctx.fill();
      const labelAngle = angle + slice / 2;
      const percent = Math.round((item.value / total) * 100);
      if (percent >= 8) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 14px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${percent}%`, cx + Math.cos(labelAngle) * radius * 0.58, cy + Math.sin(labelAngle) * radius * 0.58);
      }
    }
    angle += slice;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  drawCanvasFlag(ctx, flags[report.home], cx - radius - 54, cy - 24, 48, 32, report.home);
  drawCanvasFlag(ctx, flags[report.away], cx + radius + 10, cy - 24, 48, 32, report.away);

  ctx.fillStyle = colors.draw;
  ctx.beginPath();
  ctx.arc(cx, cy + radius + 32, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#17202a";
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(t("draw"), cx, cy + radius + 56);
}

function drawCanvasFlag(ctx, code, x, y, w, h, fallback) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#d8dee8";
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#17202a";
  ctx.font = "700 11px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(code ? code.toUpperCase() : fallback.slice(0, 3).toUpperCase(), x + w / 2, y + h / 2);
  ctx.restore();
}

function renderPredictionForm(match) {
  return `
    <form class="prediction-form" data-match-id="${match.id}" data-stage="${match.stage}">
      <label>${escapeHtml(match.home)} ${t("goals")}<input name="homeScore" type="number" min="0" max="99" required></label>
      <label>${escapeHtml(match.away)} ${t("goals")}<input name="awayScore" type="number" min="0" max="99" required></label>
      <label class="penalty-choice">${t("penaltyWinner")}
        <select name="penaltyWinner">
          <option value="">${t("choose")}</option>
          <option value="home">${escapeHtml(match.home)}</option>
          <option value="away">${escapeHtml(match.away)}</option>
        </select>
      </label>
      <button>${t("save")}</button>
      <div class="error wide"></div>
    </form>
  `;
}

function renderRanking() {
  return `
    <section class="side-section">
      <h2>${t("ranking")}</h2>
      <div class="ranking">
        ${state.data.standings.map((player, index) => `
          <div class="rank-row">
            <span class="rank">${player.rank || index + 1}</span>
            ${rankingAvatar(player)}
            <span>${escapeHtml(player.name)}<br><span class="meta">${player.predicted} ${t("predictionCount")}</span></span>
            <span class="exacts"><strong>${player.exacts || 0}</strong><small>${t("exactPredictionCount")}</small></span>
            <span class="points">${player.points}</span>
          </div>
        `).join("") || `<div class="empty">${t("noPlayers")}</div>`}
      </div>
    </section>
  `;
}

function renderRules() {
  return `
    <section class="side-section">
      <h2>${t("scoring")}</h2>
      <div class="rules">
        <div><strong>${t("groupStage")}</strong><br>${t("groupSummary")}</div>
        <div><strong>${t("knockout")}</strong><br>${t("knockoutSummary")}</div>
        <div><strong>${t("timing")}</strong><br>${t("timingSummary")}</div>
      </div>
    </section>
  `;
}

function renderFunFactsPage() {
  const reports = state.data.reports || [];
  return `
    <section class="panel">
      <h2>${t("funFacts")}</h2>
      ${reports.length ? reports.map(renderReport).join("") : `<div class="empty">${t("noFunFacts")}</div>`}
    </section>
  `;
}

function renderReport(report) {
  const title = state.lang === "fa" ? report.titleFa : report.titleEn;
  const bullets = state.lang === "fa" ? report.bulletsFa : report.bulletsEn;
  const period = formatReportPeriod(report);
  return `
    <article class="report-card">
      <div class="report-head">
        <h3>${escapeHtml(title || report.date)}</h3>
        <div class="report-actions">
          <span class="meta">${escapeHtml(period)} - ${t("generatedOn")} ${formatKickoff(report.createdAt)}</span>
          ${state.user?.isAdmin ? `<button type="button" class="ghost delete-report" data-report-id="${escapeHtml(report.id)}" data-report-date="${escapeHtml(report.date)}">${t("delete")}</button>` : ""}
        </div>
      </div>
      <ul>
        ${(bullets || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderMatchReportsPage() {
  const reports = state.data.preMatchReports || [];
  return `
    <section class="panel">
      <h2>${t("matchReports")}</h2>
      ${reports.length ? reports.map(renderPreMatchReport).join("") : `<div class="empty">${t("noMatchReports")}</div>`}
    </section>
  `;
}

function renderPreMatchReport(report) {
  const chartId = `pie-${report.id}`;
  return `
    <article class="report-card pre-match-card">
      <div class="report-head">
        <div>
          <h3>${t("preMatchReport")}: ${escapeHtml(report.fixture)}</h3>
          <span class="meta">${formatKickoff(report.kickoff)} - ${t("generatedOn")} ${formatKickoff(report.createdAt)}</span>
        </div>
        ${state.user?.isAdmin ? `<button type="button" class="ghost delete-prematch-report" data-report-id="${escapeHtml(report.id)}">${t("delete")}</button>` : ""}
      </div>
      <p class="meta">${t("participantsPredicted", { count: report.totalPredictions, total: report.totalPlayers })}</p>
      <h4>${t("predictionDistribution")}</h4>
      <div class="pie-report">
        <canvas class="prediction-pie" id="${chartId}" width="360" height="260"></canvas>
        <div class="pie-legend">
          ${(report.outcomes || []).map(item => `
            <div class="pie-legend-row">
              ${item.key === "draw" ? `<span class="draw-dot"></span>` : teamFlagImg(item.label)}
              <span>${escapeHtml(item.label === "Draw" ? t("draw") : item.label)}</span>
              <strong>${item.count}</strong>
              <span class="meta">${item.percentOfPredictions}% ${t("percentOfPredictions")}</span>
            </div>
          `).join("")}
        </div>
      </div>
      <h4>${t("mostFrequentScores")}</h4>
      ${(report.mostFrequentScores || []).length ? `
        <ul class="frequent-score-list">
          ${report.mostFrequentScores.map(item => `<li>${escapeHtml(frequentScoreSentence(report, item))}</li>`).join("")}
        </ul>
      ` : `<div class="empty">${t("noPredictionsYet")}</div>`}
      <details>
        <summary>${t("allPredictions")}</summary>
        <div class="prediction-mini-list">
          ${(report.predictions || []).map(item => `<span>${escapeHtml(item.player)}: ${escapeHtml(predictionReportScore(item))}</span>`).join("") || t("noPredictionsYet")}
        </div>
      </details>
    </article>
  `;
}

function predictionReportScore(item) {
  return item.penaltyWinner ? `${item.score}, ${item.penaltyWinner} ${t("onPenalties")}` : item.score;
}

function teamFlagImg(team) {
  const code = flags[team] || "";
  return code ? `<img class="flag" src="https://flagcdn.com/w40/${code}.png" alt="" loading="lazy">` : `<span class="draw-dot"></span>`;
}

function frequentScoreSentence(report, item) {
  const parsed = parseScoreLabel(item.score);
  if (!parsed) return `${item.count} - ${item.score}`;
  const winner = parsed.home > parsed.away ? report.home : parsed.away > parsed.home ? report.away : "";
  if (!winner) return t("frequentDrawSentence", { count: item.count, score: `${parsed.home}-${parsed.away}` });
  return t("frequentPredictionSentence", { count: item.count, score: `${parsed.home}-${parsed.away}`, team: winner });
}

function parseScoreLabel(score) {
  const match = String(score || "").match(/^(\d+)-(\d+)/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function renderRulesPage() {
  return `
    <section class="panel rules-page">
      <h2>${t("groupStageTitle")}</h2>
      <table class="rules-table">
        <thead>
          <tr><th>${t("predictionResult")}</th><th>${t("points")}</th></tr>
        </thead>
        <tbody>
          <tr><td>${t("exactScoreRule")}</td><td>10</td></tr>
          <tr><td>${t("diffRule")}</td><td>7</td></tr>
          <tr><td>${t("winnerOnlyRule")}</td><td>4</td></tr>
          <tr><td>${t("wrongOutcomeRule")}</td><td>0</td></tr>
          <tr><td>${t("noPredictionRule")}</td><td>0</td></tr>
        </tbody>
      </table>
    </section>

    <section class="panel rules-page">
      <h2>${t("knockoutPlayTitle")}</h2>
      <p class="meta">${t("knockoutPlayNote")}</p>
      <table class="rules-table">
        <thead>
          <tr>
            <th>${t("predictionResult")}</th>
            <th>${t("round32Only")}</th>
            <th>${t("round16Only")}</th>
            <th>${t("quarterThird")}</th>
            <th>${t("semiFinal")}</th>
            <th>${t("final")}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>${t("exactScoreRule")}</td><td>15</td><td>20</td><td>25</td><td>30</td><td>35</td></tr>
          <tr><td>${t("winnerDiffRule")}</td><td>11</td><td>15</td><td>19</td><td>23</td><td>27</td></tr>
          <tr><td>${t("winnerOnlyRule")}</td><td>7</td><td>10</td><td>13</td><td>16</td><td>19</td></tr>
          <tr><td>${t("penWinnerWhenActualInPlayRule")}</td><td>3</td><td>5</td><td>7</td><td>9</td><td>11</td></tr>
          <tr><td>${t("winnerWrongRule")}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        </tbody>
      </table>
    </section>

    <section class="panel rules-page">
      <h2>${t("knockoutPensTitle")}</h2>
      <p class="meta">${t("knockoutPensNote")}</p>
      <table class="rules-table">
        <thead>
          <tr>
            <th>${t("predictionResult")}</th>
            <th>${t("round32Only")}</th>
            <th>${t("round16Only")}</th>
            <th>${t("quarterThird")}</th>
            <th>${t("semiFinal")}</th>
            <th>${t("final")}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>${t("pensExactRule")}</td><td>15</td><td>20</td><td>25</td><td>30</td><td>35</td></tr>
          <tr><td>${t("pensExactWrongRule")}</td><td>11</td><td>15</td><td>19</td><td>23</td><td>27</td></tr>
          <tr><td>${t("pensWinnerRule")}</td><td>9</td><td>12</td><td>15</td><td>18</td><td>21</td></tr>
          <tr><td>${t("pensWrongRule")}</td><td>6</td><td>8</td><td>10</td><td>12</td><td>14</td></tr>
          <tr><td>${t("pensLiveWinnerRule")}</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
          <tr><td>${t("winnerWrongRule")}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
        </tbody>
      </table>
    </section>
  `;
}

function renderAccountPage() {
  const accountUser = state.user || {};
  return `
    <section class="panel account-panel">
      <h2>${t("accountSettings")}</h2>
      <div class="notice">${t("accountNotice")}</div>
      <form id="account-form" class="account-form">
        <div class="avatar-editor wide">
          <div id="avatar-preview">${playerAvatar(accountUser, "large")}</div>
          <div class="avatar-fields">
            <label>${t("favoriteTeam")}
              <select name="favoriteTeam" id="favorite-team-select">${favoriteTeamOptions(accountUser.favoriteTeam || "")}</select>
            </label>
            <label>${t("uploadPhoto")}<input name="avatarFile" id="avatar-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
            <input type="hidden" name="avatarDataUrl" id="avatar-data-url" value="${escapeHtml(accountUser.avatarDataUrl || "")}">
            <button type="button" class="ghost" id="use-team-avatar">${t("useTeamAvatar")}</button>
            <span class="meta">${t("avatarNotice")}</span>
          </div>
        </div>
        <label>${t("email")}<input name="email" type="email" autocomplete="email" value="${escapeHtml(accountUser.email || "")}"></label>
        <label>${t("screenName")}<input name="screenName" value="${escapeHtml(accountUser.name || "")}" maxlength="40" required></label>
        <label>${t("currentPassword")}<input name="currentPassword" type="password" autocomplete="current-password"></label>
        <label>${t("newPassword")}<input name="newPassword" type="password" autocomplete="new-password" minlength="6" placeholder="${t("keepPassword")}"></label>
        <label>${t("confirmNewPassword")}<input name="confirmPassword" type="password" autocomplete="new-password" minlength="6"></label>
        <button>${t("updateAccount")}</button>
        <div class="error wide" id="account-error"></div>
        <div class="success wide" id="account-success">${state.accountSaved ? t("accountUpdated") : ""}</div>
      </form>
    </section>
  `;
}

function renderAdmin() {
  return `
    <section class="panel">
      <h2>${t("admin")}</h2>
      <div class="notice">${t("adminNotice")}</div>
      <div class="error" id="admin-error"></div>
    </section>
    <nav class="tabs admin-tabs">
      ${adminTabButton("scores", t("updateScore"))}
      ${adminTabButton("fixture", t("updateFixture"))}
      ${adminTabButton("users", t("userManagement"))}
      ${adminTabButton("fun", t("generateFunFacts"))}
      ${adminTabButton("prematch", t("preMatchReports"))}
    </nav>
    ${state.adminTab === "scores" ? renderScoreAdmin() : ""}
    ${state.adminTab === "fixture" ? renderFixtureAdmin() : ""}
    ${state.adminTab === "users" ? renderUserAdmin() : ""}
    ${state.adminTab === "fun" ? renderFunFactsAdmin() : ""}
    ${state.adminTab === "prematch" ? renderPreMatchAdmin() : ""}
  `;
}

function adminTabButton(tab, label) {
  return `<button class="tab ${state.adminTab === tab ? "active" : ""}" data-admin-tab="${tab}">${label}</button>`;
}

function renderUserAdmin() {
  const players = [...state.data.players].sort((a, b) => Number(b.approved === false) - Number(a.approved === false) || a.name.localeCompare(b.name));
  return `
    <section class="panel" style="margin-top:16px">
      <h2>${t("users")}</h2>
      <div class="chart-actions">
        <button type="button" class="secondary" id="toggle-points-chart">${t("showTotalPointsChart")}</button>
      </div>
      ${players.length ? players.map(renderUserForm).join("") : `<div class="empty">${t("noPlayers")}</div>`}
      ${renderPointsChartPanel()}
      ${renderRankChartPanel()}
    </section>
  `;
}

function renderFixtureAdmin() {
  return `
    <section class="panel" style="margin-top:16px">
      <h2>${t("updateFixture")}</h2>
      <div class="notice">${t("updateFixtureNotice")}</div>
      <form id="fixture-form">
        ${renderFixtureEditor()}
        <button class="wide">${t("updateFixtureButton")}</button>
        <div class="error wide" id="fixture-error"></div>
      </form>
    </section>
  `;
}

function renderScoreAdmin() {
  return `
    <section class="panel" style="margin-top:16px">
      <h2>${t("addEditMatch")}</h2>
      <form id="match-form" class="admin-grid">
        <label>${t("matchNumber")}<input name="number" type="number" min="1" required></label>
        <label>${t("stage")}<select name="stage">${["group", "round32", "round16", "quarter", "semi", "third", "final"].map(key => `<option value="${key}">${stageLabel(key)}</option>`).join("")}</select></label>
        <label>${t("home")}<input name="home" required></label>
        <label>${t("away")}<input name="away" required></label>
        <label>${t("group")}<input name="group" placeholder="A"></label>
        <label>${t("kickoff")}<input name="kickoff" type="datetime-local" required></label>
        <label class="wide">${t("venue")}<input name="venue"></label>
        <button class="wide">${t("saveMatch")}</button>
      </form>
    </section>
    <section class="panel" style="margin-top:16px">
      <h2>${t("results")}</h2>
      ${state.data.matches.map(renderScoreForm).join("")}
    </section>
    <section class="panel" style="margin-top:16px">
      <h2>${t("bulkImport")}</h2>
      <form id="import-form" class="admin-grid">
        <label class="wide">${t("jsonMatches")}<textarea name="matches" placeholder='[{"number":1,"stage":"group","group":"A","home":"Mexico","away":"South Africa","kickoff":"2026-06-11T19:00:00.000Z","venue":"Estadio Azteca"}]'></textarea></label>
        <button class="wide">${t("replaceFixture")}</button>
      </form>
    </section>
  `;
}

function renderFunFactsAdmin() {
  return `
    <section class="panel" style="margin-top:16px">
      <h2>${t("generateFunFacts")}</h2>
      <div class="notice">${t("funFactsNotice")}</div>
      <form id="fun-facts-form" class="admin-grid">
        <button class="wide" ${state.funFactsLoading ? "disabled" : ""}>${state.funFactsLoading ? t("funFactsLoading") : t("generateReport")}</button>
        <div class="success wide" id="fun-facts-status">${state.funFactsLoading ? t("funFactsLoading") : ""}</div>
        <div class="error wide" id="fun-facts-error"></div>
      </form>
    </section>
    ${renderFunFactsPage()}
  `;
}

function renderPreMatchAdmin() {
  const closedMatches = state.data.matches.filter(match => Date.now() >= new Date(match.kickoff).getTime());
  return `
    <section class="panel" style="margin-top:16px">
      <h2>${t("generatePreMatchReport")}</h2>
      <div class="notice">${t("preMatchNotice")}</div>
      <form id="pre-match-form" class="admin-grid">
        <label>${t("selectMatch")}
          <select name="matchId" required>
            ${closedMatches.map(match => `<option value="${match.id}">${match.number}. ${escapeHtml(match.home)} vs ${escapeHtml(match.away)} - ${formatKickoff(match.kickoff)}</option>`).join("")}
          </select>
        </label>
        <button>${t("generatePreMatchReport")}</button>
        <div class="error wide" id="pre-match-error"></div>
      </form>
    </section>
    ${renderMatchReportsPage()}
  `;
}

function renderRankChartPanel() {
  if (!state.chartPlayerId) return "";
  const player = state.data.players.find(item => item.id === state.chartPlayerId);
  if (!player) return "";
  const history = buildRankHistory(state.chartPlayerId);
  return `
    <section class="rank-chart-panel">
      <h3>${t("rankChartTitle", { name: escapeHtml(player.name) })}</h3>
      ${history.length ? `<canvas id="rank-chart" width="980" height="460"></canvas>` : `<div class="empty">${t("noRankHistory")}</div>`}
    </section>
  `;
}

function renderPointsChartPanel() {
  if (!state.showPointsChart) return "";
  return `
    <section class="rank-chart-panel points-chart-panel">
      <h3>${t("pointsChartTitle")}</h3>
      ${state.data.standings.length ? `<canvas id="points-chart" width="980" height="620"></canvas>` : `<div class="empty">${t("noPlayers")}</div>`}
    </section>
  `;
}

function renderFixtureEditor() {
  const knockoutMatches = state.data.matches.filter(match => match.stage !== "group");
  return knockoutMatches.map(match => `
    <div class="fixture-row" data-match-id="${match.id}">
      <div>
        <strong>${t("matchNumber")} ${match.number}</strong><br>
        <span class="meta">${stageLabel(match.stage)} - ${formatKickoff(match.kickoff)}</span>
      </div>
      <label>${t("homeTeam")}<input name="home" value="${escapeHtml(match.home)}"></label>
      <label>${t("awayTeam")}<input name="away" value="${escapeHtml(match.away)}"></label>
    </div>
  `).join("");
}

function renderUserForm(player) {
  return `
    <form class="user-form" data-player-id="${player.id}">
      <div><strong>${player.approved === false ? t("pendingApproval") : t("approvedUser")}</strong><br><span class="pill ${player.approved === false ? "pending" : "done"}">${player.approved === false ? t("pendingApproval") : t("approvedUser")}</span></div>
      <label>${t("username")}<input name="username" value="${escapeHtml(player.username || "")}" required></label>
      <label>${t("email")}<input name="email" type="email" value="${escapeHtml(player.email || "")}"></label>
      <label>${t("screenName")}<input name="screenName" value="${escapeHtml(player.name || "")}" required></label>
      <label>${t("newPassword")}<input name="password" type="password" placeholder="${t("keepPassword")}"></label>
      <button>${t("saveUser")}</button>
      ${player.approved === false ? `<button type="button" class="secondary approve-user">${t("approveUser")}</button>` : ""}
      <button type="button" class="ghost rank-chart-button">${t("showRankChart")}</button>
      <button type="button" class="ghost delete-user">${t("delete")}</button>
      <div class="error wide"></div>
    </form>
  `;
}

function renderScoreForm(match) {
  const hasScore = Number.isFinite(match.homeScore) && Number.isFinite(match.awayScore);
  return `
    <form class="score-form" data-match-id="${match.id}" data-stage="${match.stage}">
      <div><strong>${match.number}. ${teamLabel(match.home)} vs ${teamLabel(match.away)}</strong><br><span class="meta">${stageLabel(match.stage)} - ${formatKickoff(match.kickoff)}</span></div>
      <label>${escapeHtml(match.home)}<input name="homeScore" type="number" min="0" max="99" value="${Number.isFinite(match.homeScore) ? match.homeScore : ""}" required></label>
      <label>${escapeHtml(match.away)}<input name="awayScore" type="number" min="0" max="99" value="${Number.isFinite(match.awayScore) ? match.awayScore : ""}" required></label>
      <label>${t("penaltyWinner")}<select name="penaltyWinner">
        <option value="">${t("none")}</option>
        <option value="home" ${match.penaltyWinner === "home" ? "selected" : ""}>${escapeHtml(match.home)}</option>
        <option value="away" ${match.penaltyWinner === "away" ? "selected" : ""}>${escapeHtml(match.away)}</option>
      </select></label>
      <button>${t("saveResult")}</button>
      <button type="button" class="ghost clear-score" ${hasScore ? "" : "disabled"}>${t("clear")}</button>
      <button type="button" class="ghost delete-match">${t("delete")}</button>
      <div class="error wide"></div>
    </form>
  `;
}

function wireCommon() {
  wireLanguageSelector("#language-select-header");
  document.querySelector("#sign-out")?.addEventListener("click", () => {
    localStorage.removeItem("wc-token");
    localStorage.removeItem("wc-user");
    state.token = "";
    state.user = null;
    state.tab = "matches";
    render();
  });
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      const previousTab = state.tab;
      state.tab = button.dataset.tab;
      if (state.tab === "matches" && previousTab !== "matches") {
        state.day = "all";
        state.dayManuallySelected = false;
        state.autoScrollToToday = true;
      }
      if (state.tab !== "account") state.accountSaved = false;
      render();
    });
  });
}

function wireMatches() {
  document.querySelectorAll("[data-day]").forEach(button => {
    button.addEventListener("click", () => {
      state.day = button.dataset.day;
      state.dayManuallySelected = true;
      render();
    });
  });
  document.querySelector("#timezone-select")?.addEventListener("change", event => {
    state.timezone = event.target.value;
    state.day = "all";
    state.dayManuallySelected = false;
    state.autoScrollToToday = true;
    localStorage.setItem("wc-timezone", state.timezone);
    render();
  });
  document.querySelectorAll(".prediction-form").forEach(form => {
    const updatePenalty = () => {
      const home = Number(form.elements.homeScore.value);
      const away = Number(form.elements.awayScore.value);
      form.classList.toggle("show-penalty", form.dataset.stage !== "group" && Number.isFinite(home) && Number.isFinite(away) && home === away);
    };
    form.elements.homeScore.addEventListener("input", updatePenalty);
    form.elements.awayScore.addEventListener("input", updatePenalty);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/predictions", {
          method: "POST",
          body: JSON.stringify({
            matchId: form.dataset.matchId,
            homeScore: form.elements.homeScore.value,
            awayScore: form.elements.awayScore.value,
            penaltyWinner: form.elements.penaltyWinner?.value || ""
          })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
  });
}

function updateAccountAvatarPreview(form) {
  const preview = document.querySelector("#avatar-preview");
  if (!preview) return;
  preview.innerHTML = playerAvatar({
    name: form.elements.screenName.value || state.user?.name || "",
    favoriteTeam: form.elements.favoriteTeam.value,
    avatarDataUrl: form.elements.avatarDataUrl.value
  }, "large");
}

function resizeAvatarFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return resolve("");
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(t("photoTooLarge")));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error(t("photoTooLarge")));
      image.onload = () => {
        const maxSize = 240;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function wireAccount() {
  const form = document.querySelector("#account-form");
  if (!form) return;
  form.elements.favoriteTeam.addEventListener("change", () => updateAccountAvatarPreview(form));
  form.elements.screenName.addEventListener("input", () => updateAccountAvatarPreview(form));
  form.elements.avatarFile.addEventListener("change", async () => {
    const error = document.querySelector("#account-error");
    error.textContent = "";
    try {
      const file = form.elements.avatarFile.files[0];
      if (file && file.size > 5_000_000) throw new Error(t("photoTooLarge"));
      form.elements.avatarDataUrl.value = await resizeAvatarFile(file);
      updateAccountAvatarPreview(form);
    } catch (err) {
      form.elements.avatarFile.value = "";
      error.textContent = err.message;
    }
  });
  document.querySelector("#use-team-avatar")?.addEventListener("click", () => {
    form.elements.avatarFile.value = "";
    form.elements.avatarDataUrl.value = "";
    updateAccountAvatarPreview(form);
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const error = document.querySelector("#account-error");
    const success = document.querySelector("#account-success");
    state.accountSaved = false;
    error.textContent = "";
    success.textContent = "";
    if (form.elements.newPassword.value !== form.elements.confirmPassword.value) {
      error.textContent = t("passwordMismatch");
      return;
    }
    try {
      const payload = await api("/api/account", {
        method: "POST",
        body: JSON.stringify({
          screenName: form.elements.screenName.value,
          email: form.elements.email.value,
          currentPassword: form.elements.currentPassword.value,
          newPassword: form.elements.newPassword.value,
          favoriteTeam: form.elements.favoriteTeam.value,
          avatarDataUrl: form.elements.avatarDataUrl.value
        })
      });
      state.token = payload.token;
      state.user = payload.user;
      state.data = payload.state;
      localStorage.setItem("wc-token", state.token);
      localStorage.setItem("wc-user", JSON.stringify(state.user));
      state.accountSaved = true;
      render();
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

function wireAdmin() {
  document.querySelectorAll("[data-admin-tab]").forEach(button => {
    button.addEventListener("click", () => {
      state.adminTab = button.dataset.adminTab;
      render();
    });
  });

  document.querySelector("#toggle-points-chart")?.addEventListener("click", () => {
    state.showPointsChart = !state.showPointsChart;
    render();
  });

  document.querySelectorAll(".delete-report").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm(t("deleteReportConfirm"))) return;
      try {
        state.data = await api("/api/admin/fun-facts/delete", {
          method: "POST",
          body: JSON.stringify({ reportId: button.dataset.reportId, date: button.dataset.reportDate })
        });
        render();
      } catch (err) {
        alert(err.message);
      }
    });
  });

  document.querySelectorAll(".delete-prematch-report").forEach(button => {
    button.addEventListener("click", async () => {
      if (!confirm(t("deletePreMatchReportConfirm"))) return;
      try {
        state.data = await api("/api/admin/pre-match-report/delete", {
          method: "POST",
          body: JSON.stringify({ reportId: button.dataset.reportId })
        });
        render();
      } catch (err) {
        alert(err.message);
      }
    });
  });
  drawPredictionPieCharts();

  document.querySelectorAll(".user-form").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/users", {
          method: "POST",
          body: JSON.stringify({
            playerId: form.dataset.playerId,
            username: form.elements.username.value,
            email: form.elements.email.value,
            screenName: form.elements.screenName.value,
            password: form.elements.password.value
          })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
    form.querySelector(".delete-user").addEventListener("click", async () => {
      const screenName = form.elements.screenName.value || "this user";
      if (!confirm(t("deleteUserConfirm", { name: screenName }))) return;
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/users/delete", {
          method: "POST",
          body: JSON.stringify({ playerId: form.dataset.playerId })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
    form.querySelector(".approve-user")?.addEventListener("click", async () => {
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/users/approve", {
          method: "POST",
          body: JSON.stringify({ playerId: form.dataset.playerId })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
    form.querySelector(".rank-chart-button").addEventListener("click", () => {
      state.chartPlayerId = form.dataset.playerId;
      render();
    });
  });

  document.querySelector("#match-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const kickoff = new Date(form.elements.kickoff.value);
    if (Number.isNaN(kickoff.getTime())) {
      alert("Please enter a valid kickoff time.");
      return;
    }
    payload.kickoff = kickoff.toISOString();
    state.data = await api("/api/admin/matches", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    render();
  });

  document.querySelector("#fixture-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const error = document.querySelector("#fixture-error");
    error.textContent = "";
    const matches = [...document.querySelectorAll(".fixture-row")].map(row => ({
      id: row.dataset.matchId,
      home: row.querySelector('input[name="home"]').value,
      away: row.querySelector('input[name="away"]').value
    }));
    try {
      state.data = await api("/api/admin/fixture", {
        method: "POST",
        body: JSON.stringify({ matches })
      });
      render();
    } catch (err) {
      error.textContent = err.message;
    }
  });

  document.querySelector("#fun-facts-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const error = document.querySelector("#fun-facts-error");
    const status = document.querySelector("#fun-facts-status");
    const button = form.querySelector("button");
    error.textContent = "";
    state.funFactsLoading = true;
    button.disabled = true;
    button.textContent = t("funFactsLoading");
    if (status) status.textContent = t("funFactsLoading");
    try {
      state.data = await api("/api/admin/fun-facts", {
        method: "POST",
        body: JSON.stringify({})
      });
      state.tab = "fun";
      state.funFactsLoading = false;
      render();
    } catch (err) {
      state.funFactsLoading = false;
      button.disabled = false;
      button.textContent = t("generateReport");
      if (status) status.textContent = "";
      error.textContent = err.message;
    }
  });

  document.querySelector("#pre-match-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const error = document.querySelector("#pre-match-error");
    error.textContent = "";
    try {
      state.data = await api("/api/admin/pre-match-report", {
        method: "POST",
        body: JSON.stringify({ matchId: form.elements.matchId.value })
      });
      state.adminTab = "prematch";
      render();
    } catch (err) {
      error.textContent = err.message;
    }
  });

  document.querySelectorAll(".score-form").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/results", {
          method: "POST",
          body: JSON.stringify({
            matchId: form.dataset.matchId,
            homeScore: form.elements.homeScore.value,
            awayScore: form.elements.awayScore.value,
            penaltyWinner: form.elements.penaltyWinner.value,
            status: "finished"
          })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
    form.querySelector(".clear-score").addEventListener("click", async () => {
      if (!confirm(t("clearScoreConfirm"))) return;
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/results/clear", {
          method: "POST",
          body: JSON.stringify({ matchId: form.dataset.matchId })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
    form.querySelector(".delete-match").addEventListener("click", async () => {
      if (!confirm(t("deleteMatchConfirm"))) return;
      const error = form.querySelector(".error");
      error.textContent = "";
      try {
        state.data = await api("/api/admin/matches/delete", {
          method: "POST",
          body: JSON.stringify({ matchId: form.dataset.matchId })
        });
        render();
      } catch (err) {
        error.textContent = err.message;
      }
    });
  });

  document.querySelector("#import-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const matches = JSON.parse(form.elements.matches.value);
      state.data = await api("/api/admin/import", {
        method: "POST",
        body: JSON.stringify({ matches })
      });
      render();
    } catch (err) {
      alert(err.message);
    }
  });

  drawRankChart();
  drawPointsBarChart();
}

load();
