// src/components/provider/ReviewsTab.jsx

const ReviewsTab = ({ provider }) => {
  return (
    <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">

      <h2 className="text-2xl font-bold mb-6">
        Reviews
      </h2>

      <div className="bg-gray-50 rounded-xl p-8 text-center">

        <h3 className="text-5xl mb-3">
          ⭐
        </h3>

        <p className="text-3xl font-bold">
          {provider.average_rating || "New"}
        </p>

        <p className="text-gray-500 mt-2">
          {provider.total_reviews || 0} Reviews
        </p>

      </div>

      <div className="mt-8 bg-white border rounded-xl p-8 text-center">

        <h3 className="font-semibold text-xl">
          No review details yet
        </h3>

        <p className="text-gray-500 mt-3">
          Individual customer reviews will appear here once the review system is completed.
        </p>

      </div>

    </div>
  );
};

export default ReviewsTab;