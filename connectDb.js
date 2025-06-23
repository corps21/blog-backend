import { connect } from "mongoose";

export default function connectDb(URI, password) {
	return () => {
		const newURI = URI.replace("<db-password>", encodeURIComponent(password));
		return connect(newURI);
	};
}
