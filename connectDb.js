import { connect } from "mongoose";

export default function connectDb(URI, password) {
	return () => {
		if (process.env.MONGO_ENV === "env") {
			return connect(URI);
		}
		const newURI = URI.replace("<db-password>", encodeURIComponent(password));
		return connect(newURI);
	};
}
