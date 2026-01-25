# TODO List - StageFinder Fixes

## 🔴 URGENT - Build Errors

### 1. Fix PDF Import Error in `/api/cv/parse/route.ts`
**Error**: `Export default doesn't exist in target module`
**File**: `src/app/api/cv/parse/route.ts:2`

**Solution**:
```typescript
// BEFORE (ligne 2)
import pdf from "pdf-parse";

// AFTER
// Remove the import line completely, it's already using require() in the function
```

**Status**: ⏳ Already fixed with require() but import line still exists

---

### 2. Fix Missing `availableModels` Variable
**Error**: `Cannot find name 'availableModels'`
**File**: `src/app/(app)/assistant/page.tsx:434`

**Solution**:
Add state variable in the `ClaudeChatInput` component (around line 150):

```typescript
function ClaudeChatInput({ onSendMessage, placeholder = "Message KAM...", isLoading = false }: ClaudeChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b");
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(DEFAULT_MODELS); // ADD THIS LINE
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvAnalysisMode, setCvAnalysisMode] = useState(false);

  // ADD THIS useEffect to load models from API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
          setSelectedModel(data.models[0].id);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };
    fetchModels();
  }, []);
```

**Status**: ⏳ Partially done

---

### 3. Database Migration Issue
**Error**: `Migration failed - Application table does not exist in shadow database`

**Solution**:
```bash
# Option 1: Reset shadow database
npx prisma migrate reset --skip-seed

# Option 2: Force push schema
npx prisma db push --force-reset

# Then generate client
npx prisma generate
```

**Status**: ❌ Not done

---

## 🟡 MEDIUM Priority - Features

### 4. Add Link to Models Management Page
**File**: `src/app/(app)/assistant/page.tsx`

Add a settings button to access `/models` page:

```typescript
// In the header section, add:
<Link href="/models">
  <Button variant="ghost" size="sm">
    <Settings className="h-4 w-4" />
  </Button>
</Link>
```

**Status**: ❌ Not done

---

### 5. Test PDF Extraction
**Files**: 
- `src/app/api/extract-text/route.ts`
- `src/app/api/cv/parse/route.ts`

**Test**:
1. Upload a PDF via the "+" button in `/assistant`
2. Verify text extraction works
3. Check console logs for errors

**Status**: ❌ Not tested

---

## 🟢 LOW Priority - Polish

### 6. Add Translation Keys
**Files**: `src/lib/i18n/translations/*.json`

Add missing translation keys:
- `assistantPage.starters.cvAnalysis`
- `assistantPage.starters.interviewPrep`
- `dashboard.quickActions`

**Status**: ⚠️ Using fallback text

---

### 7. Improve Error Messages
**File**: `src/app/api/extract-text/route.ts`

Make error messages more user-friendly in French.

**Status**: ✅ Done

---

## 📋 Checklist

- [ ] Fix PDF import error (remove unused import)
- [ ] Add `availableModels` state variable
- [ ] Fix database migration
- [ ] Add link to models management page
- [ ] Test PDF extraction end-to-end
- [ ] Add missing translations
- [ ] Verify all pages load without errors

---

## 🚀 Quick Start Commands

```bash
# 1. Fix database
npx prisma db push
npx prisma generate

# 2. Restart dev server
npm run dev

# 3. Test in browser
# - Go to http://localhost:3000/assistant
# - Click "+" and upload a PDF
# - Go to http://localhost:3000/models to manage AI models
```

---

## 📝 Notes

- PDF extraction now uses `pdf-parse` with `require()` to avoid ESM issues
- Models are loaded dynamically from `/api/models`
- Dashboard shows only real data (no fake data)
- AI typing speed increased 6x (5ms per character)
- Starter buttons now send messages directly to chat

---

**Last Updated**: 2026-01-25 22:22
**Priority**: Fix items 1, 2, 3 first (build errors)
