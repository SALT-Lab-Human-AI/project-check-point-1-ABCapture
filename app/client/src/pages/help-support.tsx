import { useState } from "react";

export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubject, setSupportSubject] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      icon: "📚",
      questions: [
        {
          q: "How do I record an incident?",
          a: "Go to 'Record Incident' in the sidebar, select a student, and fill out the form."
        },
        {
          q: "How do I add a student?",
          a: "Navigate to 'My Students' and click 'Add Student'."
        }
      ]
    },
    {
      category: "Technical Issues",
      icon: "🔧",
      questions: [
        {
          q: "The page isn't loading",
          a: "Try refreshing your browser or clearing your cache."
        }
      ]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) {
      alert("Please fill in all fields");
      return;
    }
    alert("Message sent! We'll get back to you soon.");
    setSupportSubject("");
    setSupportMessage("");
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
      
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search help articles..."
            className="w-full p-3 border rounded-lg pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        {faqs.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{section.icon}</span>
              <h3 className="text-lg font-medium">{section.category}</h3>
            </div>
            <div className="space-y-2">
              {section.questions.map((item, itemIndex) => {
                const id = `${sectionIndex}-${itemIndex}`;
                return (
                  <div key={id} className="border rounded-lg overflow-hidden">
                    <button
                      className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
                      onClick={() => toggleAccordion(id)}
                    >
                      <span>{item.q}</span>
                      <span>{activeAccordion === id ? "−" : "+"}</span>
                    </button>
                    {activeAccordion === id && (
                      <div className="p-4 bg-gray-50 border-t">
                        <p className="text-gray-600">{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              placeholder="How can we help?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="w-full p-2 border rounded h-32"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Please describe your issue in detail..."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send Message
          </button>
        </form>
      </div>

      {/* Contact Info */}
      <div className="mt-8 pt-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-medium">Email Us</p>
                <p className="text-sm text-gray-600">support@abcapture.com</p>
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-sm text-gray-600">1-800-ABC-HELP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
