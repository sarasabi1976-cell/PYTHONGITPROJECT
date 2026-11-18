MATCH_THRESHOLD = 60


def find_matching_roles(student_skills, careers):
    """Return careers where at least 60% of skill targets are met."""
    matches = []

    for career in careers:
        required_skills = career["skills"]
        skills_met = 0

        for skill, required_level in required_skills.items():
            student_level = student_skills.get(skill, 0)
            if student_level >= required_level:
                skills_met += 1

        if required_skills:
            match_percentage = round(
                skills_met / len(required_skills) * 100
            )

            if match_percentage >= MATCH_THRESHOLD:
                matched_career = career.copy()
                matched_career["match_percentage"] = match_percentage
                matches.append(matched_career)

    matches.sort(
        key=lambda career: career["match_percentage"],
        reverse=True
    )
    return matches
    
    def calculate_skill_gaps(student_skills, career):
    """Return the career skill targets the student has not met."""
    gaps = []

    for skill, required_level in career["skills"].items():
        student_level = student_skills.get(skill, 0)
        gap = required_level - student_level

        if gap > 0:
            gaps.append({
                "skill": skill,
                "current": student_level,
                "required": required_level,
                "gap": gap
            })

    gaps.sort(key=lambda item: item["gap"], reverse=True)
    return gaps


def order_study_tasks(skill_gaps):
    """Make a study list with the biggest skill gap first."""
    tasks = []

    for item in skill_gaps:
        skill_name = item["skill"].replace("_", " ")
        tasks.append({
            "skill": skill_name,
            "priority": item["gap"],
            "task": (
                f"Study {skill_name}: aim to improve from "
                f"{item['current']} to {item['required']}."
            )
        })

    return tasks