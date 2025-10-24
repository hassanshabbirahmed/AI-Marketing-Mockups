# Phase 2 Features: Feature Expansion (Months 3-5)

**Goal:** Increase ARPU and reduce churn through premium features
**Timeline:** 3 months
**Team:** 1-2 full-stack developers + 1 designer (part-time)
**Success Criteria:** 200 paying customers, $5,000+ MRR, <8% churn

---

## Feature 2.1: Expanded Scene Library

### Overview
Grow from 10 scenes to 30+ with industry-specific and seasonal options.

### User Stories

**As a fashion brand:**
- I want clothing and runway-specific scenes for my designs

**As a real estate agent:**
- I want property and architectural mockup scenes

**As a seasonal marketer:**
- I want holiday-themed scenes for campaigns

### New Scenes to Add

#### Industry-Specific (15 scenes)

**Fashion & Apparel:**
1. Runway Model - Design on haute couture runway
2. Store Display Window - Poster in boutique window
3. Clothing Tag - Logo on garment tag
4. Fashion Lookbook - Design in professional lookbook spread

**Real Estate & Architecture:**
5. Property Sign - Design on "For Sale" sign
6. Building Lobby - Poster in luxury lobby
7. Construction Hoarding - Large format on construction barrier

**Food & Beverage:**
8. Restaurant Menu - Design on upscale menu
9. Food Packaging - Design on delivery box
10. Cafe Window Decal - Design on storefront glass

**Tech & SaaS:**
11. App Store Screenshot - Design as mobile app screenshot
12. Trade Show Booth - Design on exhibition booth
13. Laptop Sticker - Design as laptop decal

**Events & Entertainment:**
14. Concert Poster - Design on street poster
15. Event Badge - Design on conference lanyard badge

#### Seasonal & Holiday (10 scenes)
16. Christmas Store - Holiday retail display
17. Valentine's Campaign - Romantic setting
18. Black Friday Banner - E-commerce sale banner
19. Summer Festival - Outdoor event signage
20. Back to School - Educational setting
21. New Year Billboard - Times Square style
22. Halloween Window - Spooky retail display
23. Spring Campaign - Fresh, floral setting
24. Graduation Banner - Ceremony backdrop
25. Sports Event - Stadium advertising

#### Premium Mockups (5 scenes - Business tier only)
26. 3D Product Box - Luxury packaging with shadows
27. Trade Magazine Ad - Full-page editorial
28. Airport Billboard - Large format with travelers
29. Subway Car Interior - Transit advertising
30. Taxi/Uber Car Wrap - Vehicle advertising

### Acceptance Criteria

- [ ] All 30 scenes generate quality mockups
- [ ] Scene categories are clearly organized
- [ ] Free tier: 3 scenes (existing)
- [ ] Starter tier: 10 scenes (original)
- [ ] Pro tier: 20 scenes (+ 10 new)
- [ ] Business tier: 30 scenes (all)
- [ ] Search/filter functionality works
- [ ] Each scene has example mockup
- [ ] Scene prompts optimized for quality

### Technical Requirements

**Database Schema:**
```sql
scenes (
  id: uuid
  name: string
  description: text
  category: enum ('general', 'fashion', 'realestate', 'food', 'tech', 'events', 'seasonal')
  tier_required: enum ('free', 'starter', 'pro', 'business')
  prompt_template: text
  example_image_url: string
  is_active: boolean
  sort_order: integer
  created_at: timestamp
)

scene_categories (
  id: uuid
  name: string
  icon: string
  description: text
  sort_order: integer
)
```

**API Endpoints:**
- GET /api/scenes
  - Query params: ?category=fashion&tier=pro
  - Returns: Array of available scenes for user's tier
- GET /api/scenes/:id
  - Returns: Scene details and example

### UI/UX Requirements

**Scene Selector Redesign:**
```
[Search scenes...] [Filter: All Categories ▼]

📦 General (10)
  ▸ Bus Stop, Billboard, T-Shirt...

👗 Fashion (4)
  ▸ Runway Model 🔒Pro, Store Window...

🏠 Real Estate (3)
  ▸ Property Sign 🔒Pro, Lobby...

[Show all categories...]
```

**Scene Card:**
```
┌─────────────────┐
│  [Example Img]  │
│                 │
│  Billboard      │
│  Transform your │
│  design into a  │
│  city billboard │
│  🔒 Pro         │
└─────────────────┘
```

### Success Metrics
- 30+ scenes available by end of phase
- 60%+ of users try new scenes
- 10%+ upgrade conversions from locked scenes
- <5% quality complaints on new scenes

---

## Feature 2.2: Brand Kit System

### Overview
Allow Pro+ users to save brand assets (logos, colors, fonts) for automatic application to mockups.

### User Stories

**As a brand manager:**
- I want to save my logo to auto-include in mockups
- I want to save brand colors for consistent visuals
- I want to save multiple brands (agency use case)

**As a freelancer:**
- I want to quickly switch between client brands
- I want to reuse brand settings across projects

### Acceptance Criteria

- [ ] Users can create brand kits
- [ ] Upload logo (PNG/SVG, transparent)
- [ ] Define primary and secondary colors
- [ ] Save font preferences
- [ ] Apply brand kit to generation
- [ ] Switch between multiple brand kits
- [ ] Pro tier: 1 brand kit
- [ ] Business tier: 3 brand kits
- [ ] Enterprise tier: Unlimited brand kits

### Technical Requirements

**Database Schema:**
```sql
brand_kits (
  id: uuid
  user_id: uuid
  name: string
  logo_url: string
  primary_color: string (hex)
  secondary_color: string (hex)
  font_family: string
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
)

brand_kit_assets (
  id: uuid
  brand_kit_id: uuid
  asset_type: enum ('logo', 'logo_variant', 'pattern')
  file_url: string
  file_size: integer
  created_at: timestamp
)
```

**API Endpoints:**
- POST /api/brand-kits
- GET /api/brand-kits
- PUT /api/brand-kits/:id
- DELETE /api/brand-kits/:id
- POST /api/brand-kits/:id/activate

**Brand Kit Application Logic:**
When generating mockup with active brand kit:
1. Include logo in appropriate scenes
2. Adjust prompt to match brand colors
3. Apply font preferences (if applicable)

### UI/UX Requirements

**Brand Kit Manager:**
```
Your Brand Kits (1/3 used)

┌─────────────────────────────┐
│ ✓ Active                     │
│ Acme Corp                    │
│ [Logo thumbnail]             │
│ Colors: #FF0000 #0000FF      │
│ [Edit] [Delete]              │
└─────────────────────────────┘

+ Create New Brand Kit
```

**Brand Kit Editor:**
```
Create Brand Kit

Name: ___________________
Logo: [Upload PNG/SVG] ↑
Primary Color: [#______] 🎨
Secondary Color: [#______] 🎨
Font: [Dropdown: Inter ▼]

[Save Brand Kit]
```

**Generation UI Update:**
```
3. Choose Brand Kit (optional)
○ None
● Acme Corp [Edit]
○ Create New
```

### Success Metrics
- 40%+ of Pro users create brand kit
- 70%+ of Business users create brand kit
- 80%+ of generations use brand kit (among users who created one)
- Brand kit cited as upgrade reason by 15%+ of upgraders

---

## Feature 2.3: Team Workspaces

### Overview
Enable Business tier users to collaborate with team members on mockup projects.

### User Stories

**As a team owner:**
- I want to invite team members to my workspace
- I want to control team member permissions
- I want to see team usage statistics

**As a team member:**
- I want to access shared mockups
- I want to see who created each mockup
- I want to collaborate without separate subscription

### Acceptance Criteria

- [ ] Business tier can create team workspace
- [ ] Invite members via email
- [ ] 3 seats included in Business tier
- [ ] Additional seats: $20/month each
- [ ] Shared mockup library
- [ ] Usage pooled across team
- [ ] Role-based permissions (Owner, Editor, Viewer)
- [ ] Member management (add, remove, change role)

### Technical Requirements

**Database Schema:**
```sql
workspaces (
  id: uuid
  owner_user_id: uuid
  name: string
  seats_included: integer
  seats_used: integer
  created_at: timestamp
)

workspace_members (
  id: uuid
  workspace_id: uuid
  user_id: uuid
  role: enum ('owner', 'editor', 'viewer')
  invited_email: string
  invitation_status: enum ('pending', 'accepted', 'declined')
  invited_at: timestamp
  joined_at: timestamp
)

workspace_mockups (
  id: uuid
  workspace_id: uuid
  created_by_user_id: uuid
  mockup_url: string
  scene_id: string
  created_at: timestamp
)
```

**API Endpoints:**
- POST /api/workspaces
- GET /api/workspaces/:id
- POST /api/workspaces/:id/invite
- DELETE /api/workspaces/:id/members/:userId
- GET /api/workspaces/:id/mockups
- GET /api/workspaces/:id/usage

### Permission Matrix

| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| Invite members | ✓ | ✗ | ✗ |
| Remove members | ✓ | ✗ | ✗ |
| Generate mockups | ✓ | ✓ | ✗ |
| View mockups | ✓ | ✓ | ✓ |
| Delete mockups | ✓ | ✓ | ✗ |
| Manage billing | ✓ | ✗ | ✗ |

### UI/UX Requirements

**Workspace Switcher:**
```
┌─────────────────────┐
│ Personal            │
│ Acme Corp Team   ▼  │
└─────────────────────┘
```

**Team Management Page:**
```
Team Members (3/3 seats used)

Owner
├─ Hassan (you) - Owner

Members
├─ sarah@acme.com - Editor
├─ john@acme.com - Viewer

[+ Invite Member] [Add More Seats]
```

**Invitation Email:**
```
Subject: Hassan invited you to join Acme Corp on AI Marketing Mockups

Hi Sarah,

Hassan has invited you to collaborate on the Acme Corp workspace.

[Accept Invitation]

This will give you Editor access to generate and manage mockups.
```

### Success Metrics
- 30%+ of Business users invite team members
- 70%+ invitation acceptance rate
- 20%+ purchase additional seats
- Team feature cited in 25%+ of Business upgrades

---

## Feature 2.4: Batch Upload Processing

### Overview
Allow users to upload multiple images and generate mockups for all at once.

### User Stories

**As an e-commerce seller:**
- I want to upload 20 product images and get mockups for all

**As a designer:**
- I want to process multiple client designs efficiently

### Acceptance Criteria

- [ ] Upload multiple images at once
- [ ] Select scene for batch processing
- [ ] Generate mockups for all images
- [ ] Free tier: 1 image only
- [ ] Starter tier: Up to 5 images
- [ ] Pro tier: Up to 20 images
- [ ] Business tier: Up to 100 images
- [ ] Show progress indicator
- [ ] Download all as ZIP
- [ ] Failed images can be retried

### Technical Requirements

**Database Schema:**
```sql
batch_jobs (
  id: uuid
  user_id: uuid
  total_images: integer
  completed_images: integer
  failed_images: integer
  status: enum ('processing', 'completed', 'failed')
  created_at: timestamp
  completed_at: timestamp
)

batch_items (
  id: uuid
  batch_job_id: uuid
  image_url: string
  mockup_url: string
  status: enum ('pending', 'processing', 'completed', 'failed')
  error_message: text
  created_at: timestamp
)
```

**Processing Logic:**
```javascript
async function processBatchJob(batchJobId) {
  const job = await getBatchJob(batchJobId);
  const items = await getBatchItems(batchJobId);

  for (const item of items) {
    try {
      const mockup = await generateMockup(item.image_url, job.scene_id);
      await updateBatchItem(item.id, {
        status: 'completed',
        mockup_url: mockup.url
      });
    } catch (error) {
      await updateBatchItem(item.id, {
        status: 'failed',
        error_message: error.message
      });
    }
  }

  await updateBatchJob(batchJobId, { status: 'completed' });
}
```

### UI/UX Requirements

**Batch Upload UI:**
```
Upload Images (max 20)

┌─────────┐ ┌─────────┐ ┌─────────┐
│ img1.png│ │ img2.png│ │ img3.png│ ...
└─────────┘ └─────────┘ └─────────┘

[+ Add More] [Remove All]

Scene: [Billboard ▼]
[Generate All Mockups]
```

**Progress Screen:**
```
Batch Processing (7/10 complete)

████████░░ 70%

✓ image1.png - Complete
✓ image2.png - Complete
⏳ image3.png - Processing...
⏳ image4.png - Pending
❌ image5.png - Failed (retry)
```

**Results Screen:**
```
Batch Complete (9/10 successful)

[Download All as ZIP]

✓ image1 [Download] [View]
✓ image2 [Download] [View]
❌ image3 [Retry]
```

### Success Metrics
- 25%+ of Pro users use batch processing
- 50%+ of Business users use batch processing
- <5% batch job failure rate
- Average batch size: 8 images

---

## Feature 2.5: Video Mockups (3-5 Second Loops)

### Overview
Generate short video mockups showing design in motion (e.g., billboard with moving traffic).

### User Stories

**As a social media manager:**
- I want video mockups for Instagram Reels and TikTok

**As a marketer:**
- I want dynamic content that stands out

### Acceptance Criteria

- [ ] Generate 3-5 second video loops
- [ ] Available for Pro tier and above
- [ ] Selected scenes support video (not all)
- [ ] MP4 format export
- [ ] 1080p resolution (Pro) or 4K (Business)
- [ ] Subtle motion effects (parallax, ambient)
- [ ] File size < 5MB

### Video-Enabled Scenes

1. **Billboard** - Traffic passing by
2. **Bus Stop** - People walking
3. **Laptop Screen** - Cursor movement
4. **Social Media Post** - Scroll effect
5. **Magazine Cover** - Page turn effect
6. **Store Window** - Passersby
7. **Airport Billboard** - Travelers moving
8. **Subway Car** - Train motion

### Technical Requirements

**Video Generation:**
- Use Gemini video generation capabilities (if available)
- Or: Generate 3 frames + interpolation with RunwayML/Pika
- Or: Apply motion to static mockup using After Effects API

**Database Schema:**
```sql
ALTER TABLE generation_history ADD COLUMN
  output_type: enum ('image', 'video'),
  video_duration_seconds: integer,
  video_url: string
```

**API Endpoint:**
- POST /api/mockups/generate-video
  - Input: { imageData, sceneId, duration }
  - Output: { videoUrl, thumbnailUrl }

### UI/UX Requirements

**Generation Options:**
```
Output Type:
○ Image (fast)
● Video (Pro) - 3-5 second loop

[Generate Mockup]
Est. time: 60-90 seconds
```

**Video Preview:**
```
┌───────────────────┐
│   [VIDEO PLAYER]  │
│                   │
│   ▶️ Play         │
└───────────────────┘

[Download MP4] [Share Link]
```

### Success Metrics
- 15%+ of Pro users try video mockups
- 70%+ satisfaction with video quality
- Video feature drives 20%+ of Pro upgrades
- Average generation time <90 seconds

---

## Feature 2.6: Enhanced Export Options

### Overview
Support multiple export formats and options.

### Acceptance Criteria

- [ ] PNG export (all tiers)
- [ ] JPG export (Starter+)
- [ ] WebP export (Pro+)
- [ ] PDF export (Pro+)
- [ ] Transparent background PNG (Pro+)
- [ ] Custom resolution (within tier limits)
- [ ] Bulk export as ZIP

### Export Format Matrix

| Format | Free | Starter | Pro | Business |
|--------|------|---------|-----|----------|
| PNG | ✓ | ✓ | ✓ | ✓ |
| JPG | ✗ | ✓ | ✓ | ✓ |
| WebP | ✗ | ✗ | ✓ | ✓ |
| PDF | ✗ | ✗ | ✓ | ✓ |
| Transparent | ✗ | ✗ | ✓ | ✓ |

### UI/UX Requirements

**Export Modal:**
```
Export Mockup

Format: [PNG ▼]
  - PNG (recommended)
  - JPG
  - WebP 🔒Pro
  - PDF 🔒Pro

□ Transparent background 🔒Pro

Resolution:
○ Original (3840x2160)
○ HD (1920x1080)
○ Web (1280x720)

[Download]
```

---

## Feature 2.7-2.10: Additional Features

(Continued specifications for remaining Phase 2 features...)

---

## Phase 2 Testing & Launch

### Beta Testing
- 50 selected users (mix of free and paid)
- Focus on new features: Brand Kit, Teams, Batch, Video
- 3 weeks of testing
- Feedback survey and interviews

### Performance Benchmarks
- Batch processing: <60s for 10 images
- Video generation: <90s per video
- Page load time: <2s
- Team invite acceptance: <24hr average

### Launch Strategy
- Soft launch to existing users first
- Email campaign highlighting new features
- Blog post with feature demos
- Update Product Hunt listing
- Social media campaign

### Success Metrics Review
- MRR growth: Target $5,000+
- Churn rate: <8%
- Feature adoption: >40% for key features
- User satisfaction (NPS): >40
