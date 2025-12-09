---
description: Vertical AI Demo Walkthrough
---

# UrbanClay Studio: Vertical AI Demo

This walkthrough demonstrates the "Connected Brain" of UrbanClay, showing how the consumer and business sides interact via AI.

## 1. The "Mistake" (Context)
- The user noticed a Jali image misclassified as "Exposed Brick" in the feed.
- This was due to the **V1 Vision Model** lacking specific cultural context for "Jali".

## 2. The "Fix" (Live Demo)
We have updated the AI Brain (`analyze-image.ts`) with specific definitions for:
- **Terracotta Jali** (Breathing Walls)
- **Clay Flooring** (Paving)
- **Roofing Tiles** (Interlocking)

## 3. Step-by-Step Proof
Follow these steps to prove the system is now smart:

1.  **Open Partner Dashboard**:
    - Press `Cmd+K` anywhere.
    - Select **"Partner Dashboard"** (or go to `/sales`).

2.  **Upload the Evidence**:
    - Finding a photo of a **Terracotta Jali**.
    - Drag & Drop it into the **Upload Project Gallery** zone.

3.  **Witness the Brain**:
    - Watch the `AI analyzing materials...` status.
    - **VERIFY**: The system will now auto-tag it as **"Terracotta Jali"** (not Brick).
    - **VERIFY**: It will generate a commercial name like **"Antique Red Geometric Screen"**.

4.  **Close the Loop**:
    - Note the item is now in the "Inventory".
    - Go to **Discover** (`/discover`).
    - The new, correctly labeled item will appear in the feed for users matching that style.

5.  **Verify Data (Optional)**:
    - Press `Cmd+K` and select **"Sanity Studio (CMS)"**.
    - You can view and edit the raw data directly.

## 4. Why this matters
This demonstrates **Self-Correcting Vertical AI**. The system learns from new definitions and immediately applies them to the Supply Chain (Sales) and Demand Chain (Discovery).
