# FitFi QA Playbook

## Overview
This playbook provides comprehensive testing guidelines for FitFi's AI-powered style recommendation platform. Follow these test cases to ensure quality across all user flows, features, and integrations.

## Test Environment Setup
- **Staging URL**: `https://dapper-sunflower-9949c9.netlify.app`
- **Test Browsers**: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- **Mobile Devices**: iOS Safari, Android Chrome
- **Screen Resolutions**: 320px (mobile), 768px (tablet), 1024px (desktop), 1920px (large desktop)

## Section 1: Onboarding & Flow

### Test Case 1.1: Complete User Journey
**Objective**: Verify seamless flow from landing to results

**Steps**:
1. Navigate to `/` (HomePage)
2. Fill in Name: "Test User" and Email: "test@example.com"
3. Click "Start Style Quiz"
4. Verify redirect to `/onboarding`
5. Fill form and submit
6. Verify redirect to `/gender`
7. Select gender (Man/Vrouw/Gender Neutraal)
8. Verify redirect to `/quiz/1`
9. Complete all quiz steps (1-4)
10. Verify redirect to `/results`

**Expected Results**:
- No broken redirects or 404 errors
- Form data persists across pages
- Progress indicators update correctly
- Final results page loads with personalized content

### Test Case 1.2: Form Validation
**Objective**: Ensure proper validation on all forms

**Steps**:
1. Try submitting empty name/email fields
2. Enter invalid email format
3. Verify error messages display
4. Test with special characters in name
5. Test with very long inputs

**Expected Results**:
- Clear error messages for invalid inputs
- Form prevents submission with invalid data
- Proper field highlighting for errors

### Test Case 1.3: Navigation & Back Button
**Objective**: Test browser navigation behavior

**Steps**:
1. Complete onboarding flow
2. Use browser back button at each step
3. Test forward navigation
4. Refresh page mid-flow

**Expected Results**:
- Back button works correctly
- Data persists on page refresh
- No infinite redirect loops

## Section 2: Gender Images

### Test Case 2.1: Gender Image Loading
**Objective**: Verify correct gender-specific images load

**Steps**:
1. Navigate to `/gender`
2. Verify all three gender option images load:
   - `/images/gender/male.png`
   - `/images/gender/female.png`
   - `/images/gender/neutral.png`
3. Check image alt text and accessibility
4. Test on different screen sizes

**Expected Results**:
- All images load without 404 errors
- Images have proper alt text
- Images scale correctly on mobile
- No broken image placeholders

### Test Case 2.2: Gender Selection Impact
**Objective**: Ensure gender selection affects downstream content

**Steps**:
1. Complete flow selecting "Man"
2. Note product images on results page
3. Repeat flow selecting "Vrouw"
4. Compare product images
5. Repeat with "Gender Neutraal"

**Expected Results**:
- Different product images based on gender selection
- Consistent gender-specific imagery throughout
- Fallback to default images when gender-specific unavailable

## Section 3: Product Cards

### Test Case 3.1: Product Image Mapping
**Objective**: Verify correct product images display based on gender

**Steps**:
1. Complete flow with each gender option
2. Inspect product cards on results page
3. Verify images match selected gender
4. Check fallback behavior for missing images

**Expected Results**:
- `imageUrlMale` displays for male selection
- `imageUrlFemale` displays for female selection
- `imageUrlNeutral` displays for neutral selection
- `defaultImage` displays when gender-specific image unavailable

### Test Case 3.2: Product Link Validation
**Objective**: Ensure all product links work correctly

**Steps**:
1. Navigate to results page
2. Click each "Koop bij [Retailer]" link
3. Verify links open in new tab
4. Check destination URLs are valid
5. Test "Bekijk productdetails" links

**Expected Results**:
- All links open in new tab (`target="_blank"`)
- Links lead to valid product pages
- No 404 or broken links
- Proper `rel="noopener noreferrer"` attributes

### Test Case 3.3: Product Card UI
**Objective**: Verify product card layout and interactions

**Steps**:
1. Check product card layout on different screen sizes
2. Test hover effects
3. Verify price formatting
4. Check retailer badges
5. Test star ratings display

**Expected Results**:
- Cards responsive across all screen sizes
- Smooth hover animations
- Proper price formatting (€XX.XX)
- Retailer badges clearly visible
- Star ratings display correctly

## Section 4: Unique Advice

### Test Case 4.1: Profile Variant Availability
**Objective**: Ensure sufficient advice variants exist

**Steps**:
1. Check `profileVariants` in codebase
2. Verify each profile type has ≥5 variants
3. Test randomization by completing flow multiple times
4. Document variant distribution

**Expected Results**:
- Minimum 5 variants per profile type
- Random selection works correctly
- No duplicate advice on consecutive runs
- All variants have complete data (title, subtitle, imageHero)

### Test Case 4.2: Advice Personalization
**Objective**: Verify advice matches user selections

**Steps**:
1. Complete quiz with minimalist preferences
2. Note advice content and imagery
3. Complete quiz with streetwear preferences
4. Compare advice differences
5. Test with other style preferences

**Expected Results**:
- Advice content matches selected style
- Hero images appropriate for style choice
- Personalized messaging reflects user preferences
- No generic or mismatched advice

## Section 5: UI & Accessibility

### Test Case 5.1: Header Hierarchy
**Objective**: Ensure proper semantic HTML structure

**Steps**:
1. Inspect page source on all major pages
2. Verify heading hierarchy (h1 → h2 → h3)
3. Check for multiple h1 tags (should be only one per page)
4. Validate semantic HTML structure

**Expected Results**:
- Single h1 per page
- Logical heading hierarchy
- Proper semantic HTML elements
- No heading level skipping

### Test Case 5.2: ARIA Attributes & Screen Reader
**Objective**: Test accessibility features

**Steps**:
1. Test with screen reader (NVDA/JAWS)
2. Check tooltip `aria-*` attributes
3. Verify navigation landmarks
4. Test keyboard navigation
5. Check color contrast ratios

**Expected Results**:
- Screen reader announces content correctly
- Tooltips have proper ARIA labels
- Navigation accessible via keyboard
- Color contrast meets WCAG AA standards
- Focus indicators visible

### Test Case 5.3: Mobile Responsiveness
**Objective**: Ensure optimal mobile experience

**Steps**:
1. Test on various mobile devices
2. Check touch target sizes
3. Verify mobile navigation
4. Test form inputs on mobile
5. Check image scaling

**Expected Results**:
- Touch targets ≥44px
- Mobile navigation works smoothly
- Forms easy to use on mobile
- Images scale appropriately
- No horizontal scrolling

## Section 6: Performance & Analytics

### Test Case 6.1: Page Load Performance
**Objective**: Ensure fast loading times

**Steps**:
1. Test page load speeds on 3G/4G
2. Check image optimization
3. Verify lazy loading
4. Test with slow network conditions

**Expected Results**:
- Pages load within 3 seconds on 3G
- Images properly optimized
- Lazy loading works correctly
- Graceful degradation on slow networks

### Test Case 6.2: Analytics Tracking
**Objective**: Verify analytics events fire correctly

**Steps**:
1. Open browser dev tools
2. Complete user flow
3. Monitor console for GA4 events
4. Verify event parameters
5. Check conversion tracking

**Expected Results**:
- All major events tracked (quiz_start, quiz_complete, etc.)
- Event parameters correct
- No tracking errors in console
- Conversion funnel properly tracked

## Section 7: Error Handling

### Test Case 7.1: Network Error Handling
**Objective**: Test behavior during network issues

**Steps**:
1. Simulate network disconnection
2. Try submitting forms offline
3. Test image loading failures
4. Check error messaging

**Expected Results**:
- Graceful error messages
- No application crashes
- Proper offline indicators
- Recovery when connection restored

### Test Case 7.2: Invalid Data Handling
**Objective**: Ensure robust data validation

**Steps**:
1. Submit forms with invalid data
2. Test with malicious inputs
3. Check URL parameter manipulation
4. Test with missing required data

**Expected Results**:
- Invalid data rejected gracefully
- No security vulnerabilities
- Proper error messages
- Application remains stable

## Test Execution Checklist

### Pre-Release Testing
- [ ] All test cases executed
- [ ] Cross-browser testing completed
- [ ] Mobile device testing completed
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Analytics tracking verified

### Post-Release Monitoring
- [ ] Error rates monitored
- [ ] Performance metrics tracked
- [ ] User feedback collected
- [ ] Conversion rates analyzed
- [ ] A/B test results reviewed

## Bug Reporting Template

**Bug Title**: [Brief description]
**Severity**: Critical/High/Medium/Low
**Browser**: [Browser and version]
**Device**: [Device type and OS]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshots**: [Attach if applicable]
**Additional Notes**: [Any other relevant information]

## Test Data

### Valid Test Users
- Name: "Test User", Email: "test@fitfi.app"
- Name: "Jane Doe", Email: "jane.doe@example.com"
- Name: "John Smith", Email: "john.smith@test.com"

### Invalid Test Data
- Empty fields
- Invalid email formats: "invalid-email", "@domain.com", "user@"
- Special characters: "<script>alert('xss')</script>"
- Very long inputs: 500+ character strings

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms
- **Lighthouse Performance**: >90
- **Lighthouse Accessibility**: >90
- **Lighthouse Best Practices**: >90

### Monitoring Tools
- Google PageSpeed Insights
- Lighthouse CI
- WebPageTest
- GTmetrix
- Real User Monitoring (RUM)