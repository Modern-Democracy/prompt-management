<script lang="ts">
</script>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>

<main class="p-8 bg-amber-300">
  <div class="grid grid-cols-6">
    <div class="navbar col-span-full bg-base-100">
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">daisyUI</a>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li><a>Link</a></li>
          <li>
            <details>
              <summary>
                Parent
              </summary>
              <ul class="p-2 bg-base-100">
                <li><a>Link 1</a></li>
                <li><a>Link 2</a></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
    <div class="chat col-start-2 col-end-5">
      <div class="chat chat-start">
        <div class="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
      </div>
      <div class="chat chat-end">
        <div class="chat-bubble">You underestimate my power!</div>
      </div>
    </div>
    <footer class="footer footer-center col-span-full p-4 bg-base-300 text-base-content">
      <div>
        <p>Copyright © 2023 - All right reserved by ACME Industries Ltd</p>
      </div>
    </footer>
  </div>
</main>
