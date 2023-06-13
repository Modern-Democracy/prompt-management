<script lang="ts">
</script>

<main>
  <div class="drawer">
    <div class="drawer-toggle"></div>
    <div class="drawer-content">
      <div class="navbar bg-base-100">
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
      <div class="chat">
        <div class="chat chat-start">
          <div class="chat-bubble">It's over Anakin, <br/>I have the high ground.</div>
        </div>
        <div class="chat chat-end">
          <div class="chat-bubble">You underestimate my power!</div>
        </div>
      </div>
      <footer class="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p>Copyright © 2023 - All right reserved by ACME Industries Ltd</p>
        </div>
      </footer>
    </div>
    <div class="drawer-side">
      <div class="drawer-overlay">
      </div>
      <ul class="menu bg-base-200 w-56 rounded-box">
        <li><a>Item 1</a></li>
        <li><a>Item 2</a></li>
        <li><a>Item 3</a></li>
      </ul>
    </div>
  </div>
</main>

<style>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
