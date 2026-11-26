<template>
  <section
    class="panel graphics-review"
    aria-labelledby="graphics-review-title"
  >
    <span class="eyebrow">LOOK PAST THE FEATURE LIST</span>
    <h2 id="graphics-review-title">
      A rendering feature is not an operating requirement.
    </h2>
    <div class="comparison-table-wrap">
      <table class="comparison-table">
        <caption>
          What to ask when reviewing an “advanced graphics” specification
        </caption>
        <thead>
          <tr>
            <th scope="col">Specified feature</th>
            <th scope="col">What it establishes here</th>
            <th scope="col">Information the operator actually needs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Reflective 3D equipment</th>
            <td>Equipment form and spatial appearance.</td>
            <td>
              Identity, operating state, and relationships needed for the task.
            </td>
          </tr>
          <tr>
            <th scope="row">Continuously rotating fan</th>
            <td>The command is ON; rotation follows that same bit.</td>
            <td>
              Command and separate run proof, with their mismatch made apparent.
            </td>
          </tr>
          <tr>
            <th scope="row">Moving blue air stream</th>
            <td>An illustration; no airflow sensor is modeled.</td>
            <td>
              Measured airflow and its required value, if those points exist. Do
              not invent them from an animation.
            </td>
          </tr>
          <tr>
            <th scope="row">Colored cooling coil</th>
            <td>A cooling-related component and its valve command.</td>
            <td>
              Actual temperature response, target, history, and available
              diagnostic measurements.
            </td>
          </tr>
          <tr>
            <th scope="row">Many “live” numeric values</th>
            <td>A snapshot, or retained values if quality is stale.</td>
            <td>
              Units, deviation, direction of change, and an explicit indication
              of data quality.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="lesson-note">
      <h3>Use 3D where the task calls for it.</h3>
      <p>
        ISA-101 recommends minimal sensory stimulation in normal operation and
        advises against gradients on static display elements. The reflective
        static surfaces and continuous normal motion in this mimic deliberately
        illustrate that contrast.
      </p>
      <p class="source">
        § 5.1.4; 5.2.1.2 · Standard guidance, not a prohibition on every use of
        3D.
      </p>
      <p>
        Spatial orientation, locating equipment, and maintenance training can
        benefit from an equipment model. That is a different task from deciding
        whether supply temperature is deteriorating. Demonstrate the benefit on
        the actual operator task; decorative depth and motion alone provide no
        additional process evidence in this example.
      </p>
    </div>
  </section>
  <section class="panel specification-example">
    <span class="eyebrow">WRITE A BETTER SPECIFICATION</span>
    <h2>Buy task support you can verify.</h2>
    <div class="evidence-grid">
      <div>
        <h3>Appearance-only wording</h3>
        <blockquote>
          Provide realistic 3D AHU graphics with animated fans, colored coils,
          and moving air streams.
        </blockquote>
        <p>
          Acceptance checks whether the art and motion are present. It does not
          establish whether an operator can diagnose a warm-air complaint.
        </p>
      </div>
      <div>
        <h3>Task-based wording</h3>
        <blockquote>
          For the AHU warm-air diagnostic task, show supply temperature,
          accepted target, engineering units, recent history, and data quality.
          Distinguish fan command from run proof and make their mismatch
          apparent. With operators, verify detection and interpretation of
          rising temperature, recovery, lost proof, and stale data.
        </blockquote>
        <p>
          Define the history window, performance criteria, and test conditions
          for your facility. Artwork can be added, but it does not replace this
          evidence.
        </p>
      </div>
    </div>
    <p class="source">
      Original example specification language, not a quotation or a universal
      ISA requirement.
    </p>
  </section>
</template>
