
interface WelcomeSectionProps {
  userName?: string;
}

const WelcomeSection = ({ userName }: WelcomeSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Bună, {userName || 'Utilizator'}!
      </h2>
      <p className="text-gray-600 text-sm sm:text-base">
        Iată o privire de ansamblu asupra situației tale financiare
      </p>
    </div>
  );
};

export default WelcomeSection;
