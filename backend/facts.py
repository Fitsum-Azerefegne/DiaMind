"""
A curated set of diabetes-related facts -- history, science, technology, and
notable figures. Historical claims here have been checked against reputable
sources (Science History Institute, Diabetes UK, PMC, ScienceDirect) rather
than pulled from memory alone.

This is not 365 individually hand-verified facts (that's a much bigger
research project than fits here honestly) -- it's a strong, accurate starting
set that cycles across the year via day-of-year modulo, so every day has a
fact and nothing is fabricated to hit a round number. Easy to keep appending
to over time -- just add more dicts to FACTS.
"""

FACTS = [
    # ---- History ----
    {"category": "History", "text": "Insulin was discovered in 1921 at the University of Toronto by Frederick Banting and Charles Best, working under John Macleod, with James Collip purifying it for human use."},
    {"category": "History", "text": "The first person successfully treated with insulin was 14-year-old Leonard Thompson, in January 1922 at Toronto General Hospital."},
    {"category": "History", "text": "Banting and Macleod received the Nobel Prize in Physiology or Medicine in 1923 for the discovery of insulin -- just two years after the discovery itself, one of the shortest gaps in Nobel history."},
    {"category": "History", "text": "Banting split his Nobel Prize money with Charles Best, and Macleod split his with James Collip, in recognition that the discovery was a team effort."},
    {"category": "History", "text": "Before insulin, the main treatment for type 1 diabetes was a strict low-calorie, near-starvation diet -- it slowed the disease but rarely saved lives long-term."},
    {"category": "History", "text": "Eli Lilly and Company began mass-producing insulin in 1923, the same year as the Nobel Prize, making treatment widely available for the first time."},
    {"category": "History", "text": "Early insulin was extracted from cattle and pig pancreases -- animal-derived insulin remained standard for over 50 years."},
    {"category": "History", "text": "In 1978, scientists produced human insulin using recombinant DNA technology -- bacteria engineered to manufacture the exact human insulin protein."},
    {"category": "History", "text": "Humulin, released in 1982, was the first commercially available biosynthetic human insulin, and the first recombinant DNA drug ever approved."},
    {"category": "History", "text": "The Romanian scientist Nicolae Paulescu discovered a pancreatic extract with anti-diabetic effects in 1921 as well, though his work is less widely credited due to the Nobel committee's choice."},
    {"category": "History", "text": "Diabetes was described as early as 1500 BCE in the Egyptian Ebers Papyrus, which noted a condition involving excessive urination."},
    {"category": "History", "text": "The word 'diabetes' comes from the Greek word for 'siphon,' referring to excessive urination -- one of the disease's most ancient observed symptoms."},
    {"category": "History", "text": "'Mellitus,' Latin for 'honey-sweet,' was added later after physicians noticed the sweet taste of urine in people with the condition -- literal taste-testing was a real diagnostic method for centuries."},
    {"category": "History", "text": "The distinction between what we now call type 1 and type 2 diabetes wasn't clearly established until the early 20th century."},
    {"category": "History", "text": "The Diabetes Control and Complications Trial (DCCT), concluded in 1993, was a landmark study proving that tight blood glucose control significantly reduces long-term complications in type 1 diabetes."},
    {"category": "History", "text": "The first home blood glucose meters became available to patients in the late 1970s and early 1980s, moving glucose testing out of the clinic and into daily life."},
    {"category": "History", "text": "Before home glucose meters, many people relied on urine testing strips, which only showed glucose levels well after they'd already risen significantly."},
    {"category": "History", "text": "The first wearable insulin pump was developed in the 1970s, aiming to mimic the pancreas's continuous insulin delivery instead of periodic injections."},
    {"category": "History", "text": "Continuous glucose monitors (CGMs) began reaching consumers in the early 2000s, letting people see glucose trends in real time instead of single-point-in-time readings."},
    {"category": "History", "text": "The first 'hybrid closed-loop' system -- combining a CGM and insulin pump that automatically adjust insulin delivery -- was approved in 2016."},
    {"category": "History", "text": "November 14th, World Diabetes Day, was chosen because it's Frederick Banting's birthday."},
    {"category": "History", "text": "The blue circle is the global symbol for diabetes awareness, adopted by the United Nations and International Diabetes Federation in 2007."},

    # ---- Science & Biology ----
    {"category": "Science", "text": "Insulin is produced by beta cells, found in clusters called the islets of Langerhans within the pancreas."},
    {"category": "Science", "text": "In type 1 diabetes, the immune system mistakenly attacks and destroys the pancreas's insulin-producing beta cells."},
    {"category": "Science", "text": "Type 1 diabetes is an autoimmune condition, not something caused by diet or lifestyle -- a common and frustrating misconception for people who live with it."},
    {"category": "Science", "text": "The pancreas is both an endocrine organ (making hormones like insulin) and an exocrine organ (making digestive enzymes) -- two very different jobs in one organ."},
    {"category": "Science", "text": "Glucagon, made by alpha cells in the pancreas, works opposite to insulin -- it raises blood glucose rather than lowering it."},
    {"category": "Science", "text": "The liver stores glucose as glycogen and releases it back into the bloodstream when glucose runs low, acting like a glucose reservoir."},
    {"category": "Science", "text": "Insulin's main job is helping glucose move from the bloodstream into cells, where it's used for energy."},
    {"category": "Science", "text": "The A1C test estimates average blood glucose over roughly the past two to three months by measuring glucose attached to hemoglobin in red blood cells."},
    {"category": "Science", "text": "Red blood cells live for about three months, which is part of why A1C reflects a multi-month average rather than a single day."},
    {"category": "Science", "text": "Stress hormones like cortisol and adrenaline can raise blood glucose even without eating, since the body's 'fight or flight' response releases stored glucose for quick energy."},
    {"category": "Science", "text": "Exercise can lower blood glucose during and after activity because muscles pull in glucose for fuel, sometimes without needing as much insulin."},
    {"category": "Science", "text": "Some illnesses and infections raise insulin needs, because the body releases stress hormones to fight the illness that also raise blood glucose."},
    {"category": "Science", "text": "The 'dawn phenomenon' refers to a natural rise in blood glucose in the early morning hours, caused by overnight hormone shifts that prepare the body to wake up."},
    {"category": "Science", "text": "Type 1 and type 2 diabetes are different diseases with different causes, even though both involve high blood glucose -- type 1 is autoimmune, type 2 involves insulin resistance."},
    {"category": "Science", "text": "Roughly half of a person's genetic risk for type 1 diabetes comes from genes related to the immune system, particularly a region called HLA."},
    {"category": "Science", "text": "Having a genetic predisposition to type 1 diabetes doesn't guarantee developing it -- researchers believe environmental triggers, still not fully understood, also play a role."},
    {"category": "Science", "text": "C-peptide is a byproduct released alongside natural insulin production -- measuring it can show how much insulin someone's own pancreas is still making."},
    {"category": "Science", "text": "Ketones can build up when the body doesn't have enough insulin to use glucose for energy and starts breaking down fat instead -- this is why ketone testing matters during illness or very high glucose."},

    # ---- Technology ----
    {"category": "Technology", "text": "Modern CGMs use a small sensor inserted just under the skin that measures glucose in the fluid between cells, not directly in blood."},
    {"category": "Technology", "text": "Early glucose meters in the 1980s required a full drop of blood and took over a minute to give a reading -- modern meters need a fraction of that and give results in seconds."},
    {"category": "Technology", "text": "Insulin pumps deliver rapid-acting insulin continuously in small amounts (called basal insulin) and let the user add larger doses (bolus insulin) at meals."},
    {"category": "Technology", "text": "Smart insulin pens exist that record dose timing and amount automatically, syncing with an app -- reducing reliance on memory alone."},
    {"category": "Technology", "text": "Automated insulin delivery systems use algorithms to adjust insulin dosing based on CGM readings every few minutes, without the user manually intervening for every adjustment."},
    {"category": "Technology", "text": "Some CGMs can share glucose data in real time with a caregiver's or parent's phone, which has changed overnight safety for many families managing type 1 diabetes in kids."},
    {"category": "Technology", "text": "Researchers are actively working on 'smart insulin' that would automatically activate or deactivate based on current blood glucose levels."},
    {"category": "Technology", "text": "Islet cell transplantation is an experimental procedure where insulin-producing cells from a donor pancreas are transplanted into someone with type 1 diabetes."},
    {"category": "Technology", "text": "Stem cell research is exploring ways to grow replacement insulin-producing beta cells in the lab, aiming to eventually restore natural insulin production."},
    {"category": "Technology", "text": "Non-invasive glucose monitoring -- measuring glucose without any needle or skin puncture at all -- remains an active area of research, though not yet reliably available."},

    # ---- Notable figures ----
    {"category": "People", "text": "Elizabeth Hughes, daughter of a U.S. Secretary of State, was one of the first people saved by insulin in 1922 after years of near-starvation dieting to manage her type 1 diabetes."},
    {"category": "People", "text": "Author and actress Mary Tyler Moore lived with type 1 diabetes for most of her life and became a prominent advocate, chairing the JDRF international board for years."},
    {"category": "People", "text": "U.S. Supreme Court Justice Sonia Sotomayor has lived with type 1 diabetes since childhood and has spoken publicly about managing it throughout her career."},
    {"category": "People", "text": "Nicole Johnson became Miss America 1999 while managing type 1 diabetes with an insulin pump, and used the platform to raise awareness."},
    {"category": "People", "text": "Frederick Banting was knighted in 1934 for his role in discovering insulin -- but reportedly disliked the formality of the title."},
    {"category": "People", "text": "James Collip, who purified insulin for human use, went on to have a long career in endocrinology research beyond his early work on insulin."},
    {"category": "People", "text": "Dorothy Hodgkin, a Nobel Prize-winning chemist, determined the three-dimensional structure of insulin in 1969 using X-ray crystallography -- a discovery that took her over 30 years of work."},

    # ---- Everyday life / broad awareness (kept general, no dosing specifics) ----
    {"category": "Awareness", "text": "Diabetes distress -- the emotional toll of daily management -- is now recognized as clinically distinct from general depression, with its own validated measurement tools like the DDS and PAID scales."},
    {"category": "Awareness", "text": "Diabetes burnout is common enough that many endocrinology clinics now screen for it as a routine part of care, not just an occasional concern."},
    {"category": "Awareness", "text": "Managing type 1 diabetes well involves hundreds of small decisions a day -- researchers have estimated the daily 'decision load' is far higher than most chronic conditions."},
    {"category": "Awareness", "text": "Peer support (talking to others who actually live with type 1 diabetes) is consistently associated with better emotional coping, separate from clinical treatment itself."},
    {"category": "Awareness", "text": "The idea that type 1 diabetes is caused by eating too much sugar is one of the most common and persistent misconceptions people with the condition encounter."},
    {"category": "Awareness", "text": "Type 1 diabetes can be diagnosed at any age -- while it's often called 'juvenile diabetes,' a significant share of diagnoses happen in adulthood."},
    {"category": "Awareness", "text": "Diabetes camps for kids and teens, some dating back to the 1920s and 30s, were among the earliest peer-support models for any chronic illness."},
]
