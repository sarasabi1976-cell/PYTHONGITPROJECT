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