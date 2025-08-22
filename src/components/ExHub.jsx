function ExHub() {
    return(
          <div>
            <h2 className="text-4xl font-bold text-white">Exercises</h2>
            <p className="text-sm max-w-[45ch] leading-tight">Discover a library of movements with images, instructions, 
              and variations. Quickly find the right exercise for every client and training goal.</p>
            
            <div className="flex gap-12 mt-10">
              {/* Left side */}
              <div>
                <p className="text-sm font-bold">Name</p>
                <p className="text-sm">Seated Dumbbell Biceps Curl</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Movement Category</p>
                <p className="text-sm">Pull</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Primary Muscules</p>
                <p className="text-sm">Biceps Brachii Long Head 30%</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Joint Involvement</p>
                <p className="text-sm">Single-joint</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Joint Action</p>
                <p className="text-sm">Elbow Flexion</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>                
              </div>

              {/* Middle side */}
              <div>
                <p className="text-sm font-bold">Type of Load</p>
                <p className="text-sm">Dumbbell</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Body Part</p>
                <p className="text-sm">Upper Body</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Secondary Muscules</p>
                <p className="text-sm">Anterior Deltoid </p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Movement Pattern</p>
                <p className="text-sm">Bilateral</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Resistance Modality</p>
                <p className="text-sm">Free Weights</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
              </div>
              {/* Left side */}
              <div>
                <p className="text-sm font-bold">Type of Training</p>
                <p className="text-sm">Strength</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Muscular Group</p>
                <p className="text-sm">Biceps 85%</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Muscle Action</p>
                <p className="text-sm">Isotonic</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Planes of Motion</p>
                <p className="text-sm">Sagital</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
                <p className="text-sm font-bold">Equipment / Accesories</p>
                <p className="text-sm">Adjustable Bench</p>
                <div className="my-6 border-t border-gray-600 mt-1 w-50"/>
              </div>
            </div>
          </div>
    )
}

export default ExHub;