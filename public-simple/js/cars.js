async function onGetPosts() {
    const elPre = document.querySelector('pre')

    const res = await fetch('api/post')
    const posts = await res.json()

    elPre.innerText = JSON.stringify(posts, null, 2)
}