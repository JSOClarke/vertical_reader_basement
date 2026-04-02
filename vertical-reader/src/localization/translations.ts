export type Language = 'en' | 'ja';

export const translations = {
  en: {
    // Menu
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    tapSelect: 'Tap Select',
    showArrows: 'Show Arrows',
    viewStats: 'View Stats',
    exportProfile: 'Export Profile',
    importProfile: 'Import Profile',
    loadEpub: 'Load EPUB',
    ankiSettings: 'Anki Settings',
    languageLabel: 'Language',
    centerActive: 'Center Active',
    jumpToTitle: 'Jump to Position',
    jumpToSentence: 'Sentence #',
    go: 'Go',
    displaySettings: 'Display',
    readingSettings: 'Reading',
    dataActions: 'Data Actions',
    aestheticsSettings: 'Aesthetics',
    fontSizeLabel: 'Font Size',
    lineSpacingLabel: 'Line Spacing',
    marginLabel: 'Vertical Margin',

    // Action Tooltips
    translateTooltip: 'Translate Active Sentence [T]',
    copyTooltip: 'Copy Active Sentence [C]',
    ankiTooltip: 'Update Latest Anki Card [A]',
    bookmarkTooltip: 'Toggle Bookmark [B]',

    // Stats View
    statsTitle: 'Reading Statistics',
    charactersRead: 'Characters Read',
    daysRead: 'Days Read',
    backToReader: 'Back to Reader',

    // Anki Settings Modal
    ankiSettingsTitle: 'Anki Settings',
    targetFieldLabel: 'Target Note Field',
    targetFieldPlaceholder: 'e.g. Back, Extra, Picture',
    ankiDescription: 'The EPUB cover image will be appended to this field on your most recent Anki card.',
    cancel: 'Cancel',
    save: 'Save',

    // Alerts & Errors
    noDataLoaded: 'No data loaded!',
    invalidProfile: 'Invalid profile format.',
    failedParseProfile: 'Failed to parse profile.',
    noTextInEpub: 'No text found in EPUB.',
    failedParseEpub: 'Failed to parse EPUB',

    // Mining History
    miningHistory: 'Mining History',
    totalCardsMined: 'Total Cards Mined',
    recentMinedCards: 'Recent Activity',
    unknownBook: 'Unknown Book',
    noHistory: 'No cards mined yet.',
    bookHeader: 'Book',
    sentenceHeader: 'Sentence',

    // Toasts
    copiedToast: 'Copied to clipboard!',
    copyFailToast: 'Failed to copy',
    setAnkiFieldToast: 'Set Anki field in menu first',
    ankiSuccessToast: 'Anki card updated successfully!',
    ankiFailToast: 'Anki update failed',

    // Reset
    resetReader: 'Reset All Data',
    confirmReset: 'Are you sure you want to delete ALL data (books, stats, and settings)? This cannot be undone.',
  },
  ja: {
    // Menu
    lightMode: 'ライトモード',
    darkMode: 'ダークモード',
    tapSelect: 'タップ選択',
    showArrows: '矢印を表示',
    viewStats: '読書データ',
    exportProfile: 'エクスポート',
    importProfile: 'インポート',
    loadEpub: 'EPUBを開く',
    ankiSettings: 'Anki設定',
    languageLabel: '言語',
    centerActive: '文章を中央に表示',
    jumpToTitle: 'ページ移動',
    jumpToSentence: '文番号',
    go: '移動',
    displaySettings: '表示設定',
    readingSettings: '読書設定',
    dataActions: 'データ操作',
    aestheticsSettings: '外観設定',
    fontSizeLabel: '文字サイズ',
    lineSpacingLabel: '行間隔',
    marginLabel: '上下余白',

    // Action Tooltips
    translateTooltip: '現在の文章を翻訳 [T]',
    copyTooltip: 'クリップボードにコピー [C]',
    ankiTooltip: 'Ankiカードを更新 [A]',
    bookmarkTooltip: 'しおりを付ける [B]',

    // Stats View
    statsTitle: '読書統計',
    charactersRead: '読了文字数',
    daysRead: '読書日数',
    backToReader: 'リーダーに戻る',

    // Anki Settings Modal
    ankiSettingsTitle: 'Anki設定',
    targetFieldLabel: '対象フィールド',
    targetFieldPlaceholder: '例：Back, Extra, Picture',
    ankiDescription: '最近のAnkiカードにEPUBの表紙画像を追加します。',
    cancel: 'キャンセル',
    save: '保存',

    // Alerts & Errors
    noDataLoaded: 'データが読み込まれていません。',
    invalidProfile: 'プロファイルの形式が正しくありません。',
    failedParseProfile: 'プロファイルの解析に失敗しました。',
    noTextInEpub: 'EPUB内にテキストが見つかりませんでした。',
    failedParseEpub: 'EPUBの解析に失敗しました。',

    // Mining History
    miningHistory: '作成履歴',
    totalCardsMined: '総単語登録数',
    recentMinedCards: '最近の活動',
    unknownBook: '不明な作品',
    noHistory: '履歴はありません。',
    bookHeader: '作品',
    sentenceHeader: '文章',

    // Toasts
    copiedToast: 'クリップボードにコピーしました！',
    copyFailToast: 'コピーに失敗しました',
    setAnkiFieldToast: '先にメニューから対象フィールドを設定してください',
    ankiSuccessToast: 'Ankiカードが正常に更新されました！',
    ankiFailToast: 'Ankiの更新に失敗しました',

    // Reset
    resetReader: 'データを全削除',
    confirmReset: 'すべてのデータ（本、統計、設定）を削除してもよろしいですか？この操作は取り消せません。',
  }
};
