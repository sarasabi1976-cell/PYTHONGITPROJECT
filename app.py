from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/results", methods=["POST"])
def results():
    # Receive student form data
    student_data = request.form

    # We will add validation,
    # career matching and scheduling here.

    return render_template(
        "results.html",
        student=student_data
    )


if __name__ == "__main__":
    app.run(debug=True)