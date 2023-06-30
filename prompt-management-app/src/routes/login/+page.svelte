<script>
    import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
    import {getContext, setContext} from "svelte";
	import {goto} from "$app/navigation";
	import logo from '$lib/assets/google_signin_buttons/web/1x/btn_google_signin_dark_normal_web.png';
	import {googleAuthProvider} from "$lib/misc/firebase";

    const userState = getContext('user');

    function googleLogin() {

        const auth = getAuth();
        signInWithPopup(auth, googleAuthProvider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);

                userState.set({
                    user: result.user,
                    token: credential.accessToken
                });
				goto('/chat');
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    }
</script>

<!-- Create a tailwind card with username and password inputs and a log in button -->
		<div class="flex flex-col items-center justify-center">
            <h1 class="h1 h-20">Log In</h1>
			<!-- Display the username input -->
			<input type="text" class="w-64 h-12 px-4 mb-4 rounded-full border-2 border-gray-200 focus:outline-none focus:border-indigo-500" placeholder="Username">
			<!-- Display the password input -->
			<input type="password" class="w-64 h-12 px-4 mb-4 rounded-full border-2 border-gray-200 focus:outline-none focus:border-indigo-500" placeholder="Password">
			<!-- Display the log in button -->
			<button class="w-64 h-12 mb-4 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 focus:outline-none">Log In</button>
			<!-- Create a link to the register page -->
			<a class="h-12 text-sm text-gray-500 hover:text-indigo-500" href="/register">Don't have an account? Register here.</a>
            <!-- Display the log in button -->
            <div class="btn" on:click={googleLogin}>
                <img src={logo} alt="Google logo">
            </div>
		</div>

