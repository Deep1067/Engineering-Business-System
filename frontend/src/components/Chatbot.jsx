import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Chatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isAdminView, setIsAdminView] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: `Hello ${user?.name || ''}! I can help you with material properties, our GST billing process, or general FAQs. What do you need?` }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();

        // THE SECRET ADMIN TRIGGER
        if (userMsg === '/admin123') {
            setInput('');
            setIsAdminView(true);
            return;
        }

        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            // LIVE REPLIT BACKEND CONNECTION
            const response = await fetch('https://9a321a3a-8101-4f0c-9d5f-0b00194ea03b-00-3cdyv54qlvqr7.picard.replit.dev/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await response.json();
            
            setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Chart Data from widget(1).js
    const chartData = [
        { name: 'TMT Bars', mentions: 18, fill: '#0056b3' },
        { name: 'Mild Steel', mentions: 12, fill: '#28a745' },
        { name: 'Pipes', mentions: 9, fill: '#ffc107' },
        { name: 'Cement', mentions: 8, fill: '#17a2b8' }
    ];

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {isOpen && (
                <div style={{
                    width: '320px', height: '480px', backgroundColor: '#fff',
                    borderRadius: '10px', boxShadow: '0 5px 25px rgba(0,0,0,0.3)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    marginBottom: '15px'
                }}>
                    {/* Header */}
                    <div style={{ backgroundColor: '#0056b3', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>{isAdminView ? 'Manager Dashboard' : 'Steel & Eng Assistant'}</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {isAdminView && <button onClick={() => setIsAdminView(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>🔙</button>}
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✖</button>
                        </div>
                    </div>

                    {!isAdminView ? (
                        <>
                            {/* Chat View */}
                            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {messages.map((msg, idx) => (
                                    <div key={idx} style={{
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        backgroundColor: msg.sender === 'user' ? '#0056b3' : '#e9ecef',
                                        color: msg.sender === 'user' ? 'white' : '#333',
                                        padding: '10px 14px', borderRadius: '15px', maxWidth: '80%', fontSize: '14px', wordWrap: 'break-word'
                                    }}>
                                        {msg.text}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div style={{ alignSelf: 'flex-start', backgroundColor: '#e9ecef', color: '#333', padding: '10px 14px', borderRadius: '15px', fontSize: '14px' }}>
                                        Thinking...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ddd', backgroundColor: 'white' }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about materials or orders..."
                                    style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
                                />
                                <button onClick={handleSend} style={{ backgroundColor: '#0056b3', color: 'white', border: 'none', padding: '0 15px', marginLeft: '8px', borderRadius: '20px', cursor: 'pointer' }}>
                                    Send
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Admin Dashboard View */
                        <div style={{ flex: 1, padding: '15px', backgroundColor: '#f8f9fa', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '100%', background: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Total Inquiries Today</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0056b3' }}>47</div>
                            </div>
                            
                            <div style={{ width: '100%', background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', fontSize: '14px', color: '#333' }}>Hot Materials Demanded</h4>
                                <div style={{ width: '100%', height: '200px' }}>
                                    <ResponsiveContainer>
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" tick={{fontSize: 10}} />
                                            <YAxis tick={{fontSize: 10}} />
                                            <Tooltip />
                                            <Bar dataKey="mentions" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    style={{ backgroundColor: '#0056b3', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '30px', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}
                >
                    💬 Need Help?
                </button>
            )}
        </div>
    );
};

export default Chatbot;
