import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BaseUrl } from "../BaseUrl";

const FaqComponant = () => {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [tag, setTag] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingFaqId, setEditingFaqId] = useState(null);

  const showToast = (message, type = "success") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      default:
        toast(message);
    }
  };

  const handleClearForm = () => {
    setEditingFaqId(null);
    setQuestion("");
    setAnswer("");
    setTag("");
  };
  useEffect(() => {
    getAllFaq();
  }, []);
  function getAllFaq() {
    axios
      .get(`${BaseUrl.baseurl}/admin/get-faq`)
      .then((res) => {
        if (res.data.status) {
          setFaqs(res.data.data);
        } else {
          setFaqs([]);
        }
      })
      .catch((err) => {});
  }
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim() || !tag.trim()) {
      showToast("Please fill in both question and answer.", "error");
      return;
    }

    if (editingFaqId) {
      let data = {
        question: question,
        answer: answer,
      };

      var config = {
        method: "put",
        url: `${BaseUrl.baseurl}/admin/update-faq/${editingFaqId._id}/${0}`,
        data: data,
      };
      axios(config)
        .then(function (response) {
          if (response.data.status) {
            showToast("FAQ updated successfully!");
            getAllFaq();
            // setFaqs(response.data.data);
          } else {
            toast.error(response.data.message);
          }
        })
        .catch((err) => {});
    } else {
      let data = {
        tag: tag,
        faq: {
          question: question,
          answer: answer,
        },
      };

      let config = {
        method: "post",
        url: `${BaseUrl.baseurl}/admin/add-faq`,
        data: data,
      };
      axios(config)
        .then(function (response) {
          if (response.data.status) {
            showToast("FAQ added successfully!");
            getAllFaq();
            // setFaqs(response.data.data);
          } else {
            toast.error(response.data.message);
          }
        })
        .catch((err) => {});
    }

    handleClearForm();
  };

  const handleEditFaq = (faq) => {
    setEditingFaqId(faq);
    setQuestion(faq.faq[0].question);
    setAnswer(faq.faq[0].answer);
    setTag(faq.tag);
    toast("Editing FAQ...");
  };

  const handleDeleteFaq = (id) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
    showToast("FAQ deleted successfully!");
  };

  const formTitle = editingFaqId ? "Edit FAQ" : "Add New FAQ";
  const submitButtonText = editingFaqId ? "Update FAQ" : "Add FAQ";

  return (
    <div className="">
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        FAQ (Frequently Asked Questions)
      </h3>
      <p className="mb-6 text-[#9aa3b2] max-w-4xl">
        Use this section to manage the frequently asked questions. You can add
        new FAQs and edit or delete existing ones.
      </p>

      {/* FAQ Add/Edit Form */}
      <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
        <h4
          className="text-lg font-semibold text-[#9aa3b2] mb-4"
          id="faq-form-title"
        >
          {formTitle}
        </h4>
        <form onSubmit={handleSubmit}>
          <input type="hidden" id="faq-id" value={editingFaqId || ""} />
          <div className="mb-4">
            <label
              htmlFor="faq-question"
              className="block text-sm font-medium text-[#e7e9ee]"
            >
              Tag
            </label>
            <input
              type="text"
              id="faq-question"
              className="w-full mt-1 bg-[#0f1320] text-white border border-[#2d3748] rounded-md  focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter the tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="faq-question"
              className="block text-sm font-medium text-[#e7e9ee]"
            >
              Question
            </label>
            <input
              type="text"
              id="faq-question"
              className="w-full mt-1 bg-[#0f1320] text-white border border-[#2d3748] rounded-md  focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter the question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="faq-answer"
              className="block text-sm font-medium text-[#e7e9ee]"
            >
              Answer
            </label>
            <textarea
              id="faq-answer"
              rows="4"
              className="w-full mt-1 bg-[#0f1320] text-white border-solid border-[#2d3748] rounded-md  focus:outline-none focus:ring-2 focus:ring-indigo-600"
              placeholder="Enter the answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              id="cancel-faq-button"
              className={`${
                editingFaqId ? "" : "hidden"
              } text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-100`}
              onClick={handleClearForm}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#7c3aed] text-black py-2 px-3 rounded-xl hover:bg-[#6d28d9] transition-colors text-sm font-semibold"
              id="submit-faq-button"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>

      {/* FAQ List */}
      <div className="space-y-4 mt-6" id="faq-list">
        {faqs.map((faq) => (
          <details key={faq._id} className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50  p-4 shadow-xl  rounded-xl ">
            <summary>
              <div className="flex flex-col">
                <span className="text-lg text-[#9aa3b2] font-semibold">
                  {faq.tag}
                </span>
                <span className="text-base text-[#e7e9ee]">
                  {faq.faq[0].question}
                </span>
              </div>
              <div className="faq-actions">
                <button
                  onClick={() => handleEditFaq(faq)}
                  className="text-sky-500 hover:text-sky-700 p-1 rounded-lg transition-colors"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDeleteFaq(faq._id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-lg transition-colors"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </summary>
            <div className="faq-answer text-sm text-[#e7e9ee]">
              {faq.faq[0].answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FaqComponant;
