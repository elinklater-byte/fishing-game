# 🎣 Hook, Line & Sinker

A browser fishing game. Start on the dock with 100 coins, buy a Tiny Raft, a Rusty Rod and a pack of bait, and head out to sea.

- Walk to the **left side** of your boat, click the water, and steer your lure into fish with the mouse (or your finger).
- Your slack (line length) limits how far the lure can go. Deeper fish are worth more.
- Strong fish take several hits before they're hooked. They keep swimming the same way when hit.
- Now and then (1 spawn in 8), herring, mackerel, striped bass, tuna or amberjack arrive as a **school**.
- Fish in three places, each with its own water and real fish: the **Ocean** (open blue sea and shipwrecks), the **Arctic** (icebergs and icy water), and the **Swamp** (murky green water and cypress roots). There are 55 real species, and each one has 3 facts. You learn a different one each time you fillet that fish.
- The water is 500 m deep and gets darker as you go. Dive straight down fast and fish can't bite, which gets you past the small ones.
- Some trips have a rare **shipwreck** on the sea floor, home to the Goliath Grouper.
- Every place has a **final fish** at the very bottom: the Giant Squid (Ocean), the Greenland Shark (Arctic) and the Alligator Gar (Swamp). Catch one to put it in your **Trophy Room**. A new one comes back a while later.
- Walk to the **right side** of the boat to fillet: drag the knife across each fish. The speed meter has three zones: **green** cuts pay 100%, **yellow** 70%, and **red** 40% (and the fish bleeds). The fillet is worth the average of your cuts.
- **Bait** and **cannonballs** are sold at the market in packs of 10. Every cast uses 1 bait; every cannon shot uses 1 cannonball.
- Sail back to the dock, sell your fillets, and upgrade your rod, lure, slack, knife and bucket (6 levels each per boat).
- **Multi-Hook** (expensive): catch up to 5 fish on one cast.
- **Cannons**: rival fishermen sail past now and then. Click their boat to start a cannon battle (fire when the needle is in the green). Win and you steal their fish; lose and they take 25% of your coins and half your fish. The better their catch, the tougher they are.

## Boats

There are 7 boats: Tiny Raft, Rowboat, Skiff, Fishing Boat, Trawler, Research Vessel and Deep-Sea Explorer. Buy the next boat whenever you can afford it. It unlocks new fish, gives your hull more HP for battles, and moves your gear to Lv 1 of a **stronger set** (e.g. Rusty Rod → Bamboo Rod), which is at least as good as your best gear before. Multi-Hook and Cannon upgrades are kept.

When you start a new world, the game asks two questions: are you a man or a woman (you become a **fisherman** or **fisherwoman**), and are you playing on a **phone/iPad** or a **computer**. You can change these any time with ⚙️ Player settings at the dock.

Computer controls: ◀ ▶ / A D / arrow keys to walk · click water to cast · move mouse to steer · Space to reel in · F to fillet.

Phone / iPad controls: big ◀ ▶ buttons to walk · tap 🎣 to walk to the fishing spot and cast (or tap the water) · drag your finger to steer · tap 🎣 again to reel in · tap 🔪 to fillet and 💣 to attack. Landscape works best on a phone.

## Leaderboards

Pick a username at the dock to show up on the online leaderboards: most money earned, most fish caught, and most fish caught in each place. A crown 👑 next to a name means that player beat a final fish. Each username can only be used by one player: it's claimed by a secret key saved in your browser. If you change your name, your scores move to the new one and the old name is freed up for someone else.

The leaderboard lives in `api/leaderboard.js`, a Vercel Function that stores each player as a small JSON file in a private Vercel Blob store (`BLOB_READ_WRITE_TOKEN`).

Plain HTML/CSS/JS for the game, no build step. Fish and places are in `fishdata.js`. Progress saves in your browser.
