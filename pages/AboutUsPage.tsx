import React from 'react';

const AboutUsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in text-gray-300">
            <div className="bg-emerald-900/50 p-8 rounded-2xl border border-green-800 shadow-lg">
                <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400 mb-6">
                    About Trade X
                </h1>

                <div className="space-y-6 leading-relaxed">
                    <p>
                        Welcome to <span className="font-semibold text-green-400">Trade X</span>, your AI-powered co-pilot in the dynamic world of financial markets. Our mission is to democratize trading analysis by providing retail traders with institutional-grade tools driven by cutting-edge artificial intelligence.
                    </p>
                    
                    <h2 className="text-2xl font-semibold text-teal-300 border-b-2 border-teal-700 pb-2">Our Vision</h2>
                    <p>
                        We believe that the future of trading lies at the intersection of human intuition and machine intelligence. Markets are complex systems, influenced by a multitude of factors from macroeconomic data to fleeting market sentiment. Trade X is designed to process this vast amount of information, identify high-probability patterns, and present actionable insights, allowing you to make more informed decisions with confidence.
                    </p>

                    <h2 className="text-2xl font-semibold text-teal-300 border-b-2 border-teal-700 pb-2">What We Do</h2>
                    <p>
                        Our platform leverages the power of Google's Gemini models to perform deep, multi-faceted analysis of market data. Whether you're a scalper, a day trader, or a swing trader, our AI Analyst adapts to your style. From analyzing live chart data and candlestick patterns to interpreting complex market structures and news sentiment, Trade X provides a comprehensive breakdown of potential trading opportunities.
                    </p>

                     <h2 className="text-2xl font-semibold text-teal-300 border-b-2 border-teal-700 pb-2">Our Commitment</h2>
                    <p>
                        We are committed to continuous innovation and user empowerment. Trade X is more than just a signal provider; it's a tool for learning and strategy refinement. By providing detailed rationales for every analysis, we aim to help you understand the 'why' behind each trade idea, enhancing your own market knowledge and skills over time.
                    </p>
                    <p>
                        Thank you for joining us on this journey. Let's navigate the markets, together.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;