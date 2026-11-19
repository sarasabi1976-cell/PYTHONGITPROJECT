
        completion = start + burst

        scheduled.append({
            "id": str(gap["skillId"]),
            "title": str(gap.get("labelName") or gap["skillId"]),
            "gap": _as_int(gap["gap"]),
            "priority": index,
            "burstTime": burst,
            "waitingTime": start,
            "turnaroundTime": completion,
        })
        current_time = completion

    return {
        "algorithm": "Non-preemptive Priority Scheduling",
        "totalStudyHours": current_time,
        "tasks": scheduled,
        "averageWaitingTime": (
            sum(task["waitingTime"] for task in scheduled) / len(scheduled)
            if scheduled else 0
        ),
        "averageTurnaroundTime": (
            sum(task["turnaroundTime"] for task in scheduled) / len(scheduled)
            if scheduled else 0
        ),
    }


def recommend_careers(
    assessment: dict[str, Any],
    data: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """
    Return career recommendations in the response shape expected by
    career-results.js: title, description, matchPercent, requiredSkills,
    skillGaps, studyTasks, and links.
    """
    if data is None:
        data = load_career_data()

    student_skills = assessment.get("skills", {})
    if not isinstance(student_skills, dict):
        student_skills = {}

    catalog = data.get("skills", [])
    matches: list[dict[str, Any]] = []

    for career in data.get("careers", []):
        if not isinstance(career, dict) or not _career_is_relevant(career, assessment):
            continue

        required = career.get("requiredSkills", {})
        if not isinstance(required, dict):
            required = {}

        gaps = calculate_skill_gaps(required, student_skills)
        skill_count = len(required)
        match_percent = 100 if skill_count == 0 else round(
            100 * (skill_count - len(gaps)) / skill_count
        )

        named_gaps = []
        for gap in gaps:
            skill_name = _skill_label(gap["skillId"], catalog)
            named_gaps.append({
                **gap,
                "skillName": skill_name,
                "labelName": skill_name,
            })

        schedule = schedule_study_tasks(named_gaps)
        study_tasks = [
            (
                f"Improve {task['title']} "
                f"(gap: {task['gap']}/5; estimated {task['burstTime']} hours)"
            )
            for task in schedule["tasks"]
        ]

        required_skill_names = [
            _skill_label(skill_id, catalog)
            for skill_id in required.keys()
        ]

        matches.append({
            "id": career.get("id"),
            "title": career.get("title") or career.get("role") or "Career option",
            "description": career.get("description", ""),
            "matchPercent": match_percent,
            "requiredSkills": required_skill_names,
            "skillGaps": [
                f"{gap['skillName']}: {gap['label']} gap "
                f"({gap['currentLevel']}/5; needs {gap['requiredLevel']}/5)"
                for gap in named_gaps
            ],
            "studyTasks": study_tasks,
            "links": career.get("links", []),
            "higherStudy": career.get("higherStudy", ""),
            "source": career.get("source", {}),
            "schedule": schedule,
        })

    matches.sort(key=lambda item: item["matchPercent"], reverse=True)
    return matches


def build_plan_items(recommendations: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Convert the highest-ranked recommendation's scheduled skill gaps into
    items suitable for the Prep Plan page.
    """
    if not recommendations:
        return []

    schedule = recommendations[0].get("schedule", {})
    items = []

    for index, task in enumerate(schedule.get("tasks", []), start=1):
        items.append({
            "id": task["id"],
            "title": f"Improve {task['title']}",
            "description": (
                f"Estimated {task['burstTime']} study hours. "
                f"Priority {task['priority']}; skill gap {task['gap']}/5."
            ),
            "week": ((index - 1) // 2) + 1,
            "completed": False,
            "burstTime": task["burstTime"],
